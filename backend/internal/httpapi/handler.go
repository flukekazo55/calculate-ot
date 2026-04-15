package httpapi

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"net/mail"
	"regexp"
	"strings"
	"time"

	"calculate-ot/backend/internal/store"
	"golang.org/x/crypto/bcrypt"
)

var usernamePattern = regexp.MustCompile(`^[A-Za-z0-9._-]{3,32}$`)

// APIHandler exposes OT API endpoints with CORS middleware.
type APIHandler struct {
	repo            store.Repository
	users           store.UserRepository
	corsOrigins     []string
	allowAllOrigins bool
}

type registerRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Identity string `json:"identity"`
	Password string `json:"password"`
}

// NewHandler creates a new OT API handler.
func NewHandler(
	repo store.Repository,
	users store.UserRepository,
	corsOrigins []string,
	allowAllOrigins bool,
) http.Handler {
	h := &APIHandler{
		repo:            repo,
		users:           users,
		corsOrigins:     corsOrigins,
		allowAllOrigins: allowAllOrigins,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", h.handleHealthz)
	mux.HandleFunc("/load", h.handleLoad)
	mux.HandleFunc("/save", h.handleSave)
	mux.HandleFunc("/reset", h.handleReset)
	mux.HandleFunc("/auth/register", h.handleRegister)
	mux.HandleFunc("/auth/login", h.handleLogin)

	return h.withCORS(mux)
}

func (h *APIHandler) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if !IsAllowedOrigin(origin, h.allowAllOrigins, h.corsOrigins) {
			writeJSON(w, http.StatusForbidden, map[string]any{
				"error":  "cors_forbidden",
				"origin": origin,
			})
			return
		}

		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (h *APIHandler) handleHealthz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeMethodNotAllowed(w)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *APIHandler) handleLoad(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeMethodNotAllowed(w)
		return
	}

	repo, err := h.resolveOwnerRepo(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_username",
			"details": err.Error(),
		})
		return
	}

	data, err := repo.Load(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error":   "load_failed",
			"details": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, data)
}

func (h *APIHandler) handleSave(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeMethodNotAllowed(w)
		return
	}

	repo, err := h.resolveOwnerRepo(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_username",
			"details": err.Error(),
		})
		return
	}

	var payload store.OTData
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_json",
			"details": err.Error(),
		})
		return
	}

	savedData, err := repo.Save(r.Context(), payload)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error":   "save_failed",
			"details": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"message":   "saved",
		"savedData": savedData,
	})
}

func (h *APIHandler) handleReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeMethodNotAllowed(w)
		return
	}

	repo, err := h.resolveOwnerRepo(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_username",
			"details": err.Error(),
		})
		return
	}

	resetData, err := repo.Reset(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error":   "reset_failed",
			"details": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"message":   "reset",
		"resetData": resetData,
	})
}

func (h *APIHandler) handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeMethodNotAllowed(w)
		return
	}

	var payload registerRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_json",
			"details": err.Error(),
		})
		return
	}

	username := strings.TrimSpace(payload.Username)
	email := strings.ToLower(strings.TrimSpace(payload.Email))
	password := payload.Password

	if !usernamePattern.MatchString(username) {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_username",
			"details": "username must be 3-32 chars using letters, numbers, dot, underscore or dash",
		})
		return
	}

	if _, err := mail.ParseAddress(email); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_email",
			"details": "invalid email format",
		})
		return
	}

	if len(password) < 8 {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_password",
			"details": "password must be at least 8 characters",
		})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error":   "password_hash_failed",
			"details": err.Error(),
		})
		return
	}

	userID, err := newUserID()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error":   "user_id_failed",
			"details": err.Error(),
		})
		return
	}

	createdUser, err := h.users.Create(r.Context(), store.User{
		ID:           userID,
		Username:     username,
		Email:        email,
		PasswordHash: string(hash),
		CreatedAt:    time.Now().UTC().Format(time.RFC3339),
	})
	if err != nil {
		if errors.Is(err, store.ErrUserExists) {
			writeJSON(w, http.StatusConflict, map[string]string{
				"error":   "user_exists",
				"details": "username or email already exists",
			})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error":   "register_failed",
			"details": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "registered",
		"user":    publicUser(createdUser),
	})
}

func (h *APIHandler) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeMethodNotAllowed(w)
		return
	}

	var payload loginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_json",
			"details": err.Error(),
		})
		return
	}

	identity := strings.TrimSpace(payload.Identity)
	if identity == "" || payload.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "missing_credentials",
			"details": "identity and password are required",
		})
		return
	}

	user, err := h.users.FindByIdentity(r.Context(), identity)
	if err != nil {
		if errors.Is(err, store.ErrUserNotFound) {
			writeJSON(w, http.StatusUnauthorized, map[string]string{
				"error":   "invalid_credentials",
				"details": "invalid username/email or password",
			})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error":   "login_failed",
			"details": err.Error(),
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(payload.Password)); err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{
			"error":   "invalid_credentials",
			"details": "invalid username/email or password",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"message": "logged_in",
		"user":    publicUser(user),
	})
}

func publicUser(user store.User) map[string]string {
	return map[string]string{
		"id":        user.ID,
		"username":  user.Username,
		"email":     user.Email,
		"createdAt": user.CreatedAt,
	}
}

func newUserID() (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeMethodNotAllowed(w http.ResponseWriter) {
	writeJSON(w, http.StatusMethodNotAllowed, map[string]string{
		"error":   "method_not_allowed",
		"details": errors.New("method not allowed").Error(),
	})
}

func (h *APIHandler) resolveOwnerRepo(r *http.Request) (store.Repository, error) {
	scopedRepo, ok := h.repo.(store.OwnerScopedRepository)
	if !ok {
		return h.repo, nil
	}

	owner := strings.TrimSpace(r.URL.Query().Get("username"))
	if owner == "" {
		return nil, errors.New("username query is required")
	}

	if !usernamePattern.MatchString(owner) {
		return nil, errors.New("username query must be 3-32 chars using letters, numbers, dot, underscore or dash")
	}

	return scopedRepo.ForOwner(owner), nil
}
