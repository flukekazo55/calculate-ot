package store

import (
	"context"
)

// OTData is the persisted OT payload exchanged with the frontend.
type OTData struct {
	Records    []map[string]any `json:"records"`
	LastUpdate string           `json:"lastUpdate"`
}

// NormalizeOTData guarantees required OTData fields are present.
func NormalizeOTData(input OTData) OTData {
	normalized := OTData{
		Records:    input.Records,
		LastUpdate: input.LastUpdate,
	}
	if normalized.Records == nil {
		normalized.Records = make([]map[string]any, 0)
	}
	if normalized.LastUpdate == "" {
		normalized.LastUpdate = ""
	}
	return normalized
}

// DefaultOTData returns an empty OT payload.
func DefaultOTData() OTData {
	return OTData{Records: make([]map[string]any, 0), LastUpdate: ""}
}

// HasData reports whether OTData contains any meaningful persisted state.
func HasData(data OTData) bool {
	return len(data.Records) > 0 || data.LastUpdate != ""
}

// Repository defines persistence operations for OT data.
type Repository interface {
	Load(ctx context.Context) (OTData, error)
	Save(ctx context.Context, data OTData) (OTData, error)
	Reset(ctx context.Context) (OTData, error)
}
