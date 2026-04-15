package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"calculate-ot/backend/internal/store"
)

// APIHandler exposes OT API endpoints with CORS middleware.
type APIHandler struct {
	repo            store.Repository
	corsOrigins     []string
	allowAllOrigins bool
}

// NewHandler creates a new OT API handler.
func NewHandler(repo store.Repository, corsOrigins []string, allowAllOrigins bool) http.Handler {
	h := &APIHandler{
		repo:            repo,
		corsOrigins:     corsOrigins,
		allowAllOrigins: allowAllOrigins,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", h.handleHealthz)
	mux.HandleFunc("/load", h.handleLoad)
	mux.HandleFunc("/save", h.handleSave)
	mux.HandleFunc("/reset", h.handleReset)

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

	data, err := h.repo.Load(r.Context())
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

	var payload store.OTData
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "invalid_json",
			"details": err.Error(),
		})
		return
	}

	savedData, err := h.repo.Save(r.Context(), payload)
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

	resetData, err := h.repo.Reset(r.Context())
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
