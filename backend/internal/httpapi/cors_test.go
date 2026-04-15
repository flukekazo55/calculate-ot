package httpapi

import "testing"

func TestIsAllowedOrigin(t *testing.T) {
	tests := []struct {
		name              string
		origin            string
		allowAll          bool
		configuredOrigins []string
		want              bool
	}{
		{
			name:   "empty origin is allowed",
			origin: "",
			want:   true,
		},
		{
			name:     "allow all bypasses checks",
			origin:   "https://example.com",
			allowAll: true,
			want:     true,
		},
		{
			name:              "configured allowlist allows exact origin",
			origin:            "https://example.com",
			configuredOrigins: []string{"https://example.com"},
			want:              true,
		},
		{
			name:              "configured allowlist blocks unknown origin",
			origin:            "https://other.com",
			configuredOrigins: []string{"https://example.com"},
			want:              false,
		},
		{
			name:   "localhost default allow",
			origin: "http://localhost:4200",
			want:   true,
		},
		{
			name:   "127 loopback default allow",
			origin: "http://127.0.0.1:3000",
			want:   true,
		},
		{
			name:   "github pages default allow",
			origin: "https://flukekazo55.github.io",
			want:   true,
		},
		{
			name:   "unknown default blocked",
			origin: "https://evil.example",
			want:   false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := IsAllowedOrigin(tt.origin, tt.allowAll, tt.configuredOrigins)
			if got != tt.want {
				t.Fatalf("IsAllowedOrigin() = %v, want %v", got, tt.want)
			}
		})
	}
}
