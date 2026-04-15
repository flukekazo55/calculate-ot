package httpapi

import "regexp"

var (
	localhostOriginPattern = regexp.MustCompile(`(?i)^http://localhost(?::\d+)?$`)
	loopbackOriginPattern  = regexp.MustCompile(`(?i)^http://127\.0\.0\.1(?::\d+)?$`)
	githubIOOriginPattern  = regexp.MustCompile(`(?i)^https://[a-z0-9-]+\.github\.io$`)
)

// IsAllowedOrigin validates whether a request origin can access the API.
func IsAllowedOrigin(origin string, allowAll bool, configuredOrigins []string) bool {
	if origin == "" {
		return true
	}
	if allowAll {
		return true
	}
	if len(configuredOrigins) > 0 {
		for _, item := range configuredOrigins {
			if item == origin {
				return true
			}
		}
		return false
	}

	return localhostOriginPattern.MatchString(origin) ||
		loopbackOriginPattern.MatchString(origin) ||
		githubIOOriginPattern.MatchString(origin)
}
