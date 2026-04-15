package store

import (
	"context"
	"errors"
	"testing"
)

type fakeRepo struct {
	loadData  OTData
	loadErr   error
	savedData []OTData
	saveErr   error
	resetData OTData
	resetErr  error
}

func (f *fakeRepo) Load(context.Context) (OTData, error) {
	if f.loadErr != nil {
		return OTData{}, f.loadErr
	}
	return f.loadData, nil
}

func (f *fakeRepo) Save(_ context.Context, data OTData) (OTData, error) {
	if f.saveErr != nil {
		return OTData{}, f.saveErr
	}
	f.savedData = append(f.savedData, data)
	return data, nil
}

func (f *fakeRepo) Reset(context.Context) (OTData, error) {
	if f.resetErr != nil {
		return OTData{}, f.resetErr
	}
	return f.resetData, nil
}

func TestMultiStoreSaveWritesBothRepositories(t *testing.T) {
	primary := &fakeRepo{}
	secondary := &fakeRepo{}
	repo := NewMultiStore(primary, secondary)
	payload := OTData{Records: []map[string]any{{"id": 1}}, LastUpdate: "now"}

	got, err := repo.Save(context.Background(), payload)
	if err != nil {
		t.Fatalf("Save() error = %v", err)
	}
	if len(primary.savedData) != 1 {
		t.Fatalf("primary saved calls = %d, want 1", len(primary.savedData))
	}
	if len(secondary.savedData) != 1 {
		t.Fatalf("secondary saved calls = %d, want 1", len(secondary.savedData))
	}
	if !HasData(got) {
		t.Fatalf("Save() returned empty data, want payload")
	}
}

func TestMultiStoreLoadFallbackFromSecondary(t *testing.T) {
	primary := &fakeRepo{loadData: DefaultOTData()}
	secondary := &fakeRepo{loadData: OTData{Records: []map[string]any{{"id": 2}}, LastUpdate: "x"}}
	repo := NewMultiStore(primary, secondary)

	got, err := repo.Load(context.Background())
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if len(got.Records) != 1 {
		t.Fatalf("records length = %d, want 1", len(got.Records))
	}
	if len(primary.savedData) != 1 {
		t.Fatalf("expected primary hydration save, got %d", len(primary.savedData))
	}
}

func TestMultiStoreSaveReturnsSecondaryError(t *testing.T) {
	primary := &fakeRepo{}
	secondary := &fakeRepo{saveErr: errors.New("secondary save failed")}
	repo := NewMultiStore(primary, secondary)

	_, err := repo.Save(context.Background(), DefaultOTData())
	if err == nil {
		t.Fatalf("Save() error = nil, want error")
	}
}
