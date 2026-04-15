package store

import "testing"

func TestNormalizeOTData(t *testing.T) {
	tests := []struct {
		name string
		in   OTData
		want OTData
	}{
		{
			name: "nil records become empty slice",
			in:   OTData{Records: nil, LastUpdate: ""},
			want: OTData{Records: make([]map[string]any, 0), LastUpdate: ""},
		},
		{
			name: "existing values are preserved",
			in: OTData{
				Records:    []map[string]any{{"id": 1, "value": 2}},
				LastUpdate: "2026-04-15",
			},
			want: OTData{
				Records:    []map[string]any{{"id": 1, "value": 2}},
				LastUpdate: "2026-04-15",
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := NormalizeOTData(tt.in)
			if len(got.Records) != len(tt.want.Records) {
				t.Fatalf("records length = %d, want %d", len(got.Records), len(tt.want.Records))
			}
			if got.LastUpdate != tt.want.LastUpdate {
				t.Fatalf("lastUpdate = %q, want %q", got.LastUpdate, tt.want.LastUpdate)
			}
		})
	}
}
