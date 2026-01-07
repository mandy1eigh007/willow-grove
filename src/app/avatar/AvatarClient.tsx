"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

// Fixed option sets for avatar attributes
const SKIN_TONE_OPTIONS = ["skin_tone_1", "skin_tone_2", "skin_tone_3", "skin_tone_4", "skin_tone_5"];
const FACE_OPTIONS = ["face_1", "face_2", "face_3", "face_4", "face_5"];
const HAIR_OPTIONS = ["hair_1", "hair_2", "hair_3", "hair_4", "hair_5"];
const HAIR_COLOR_OPTIONS = ["black", "brown", "blonde", "red", "gray"];
const OUTFIT_OPTIONS = ["outfit_1", "outfit_2", "outfit_3", "outfit_4", "outfit_5"];
const ACCESSORY_OPTIONS = ["none", "accessory_1", "accessory_2", "accessory_3", "accessory_4"];

type Avatar = {
  id?: string;
  profile_id: string;
  skin_tone_id: string;
  face_id: string;
  hair_id: string;
  hair_color_id: string;
  outfit_id: string;
  accessory_id: string;
  is_active: boolean;
};

export default function AvatarClient() {
  const router = useRouter();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Avatar form fields
  const [skinToneId, setSkinToneId] = useState(SKIN_TONE_OPTIONS[0]);
  const [faceId, setFaceId] = useState(FACE_OPTIONS[0]);
  const [hairId, setHairId] = useState(HAIR_OPTIONS[0]);
  const [hairColorId, setHairColorId] = useState(HAIR_COLOR_OPTIONS[0]);
  const [outfitId, setOutfitId] = useState(OUTFIT_OPTIONS[0]);
  const [accessoryId, setAccessoryId] = useState(ACCESSORY_OPTIONS[0]);

  useEffect(() => {
    const loadActiveProfile = async () => {
      const profileId = localStorage.getItem("willow_active_profile_id");
      setActiveProfileId(profileId);
      
      if (profileId) {
        await loadCurrentAvatar(profileId);
      }
      
      setLoading(false);
    };

    loadActiveProfile();
  }, []);

  const loadCurrentAvatar = async (profileId: string) => {
    const supabase = supabaseBrowser();
    
    const { data, error } = await supabase
      .from("avatars")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_active", true)
      .single();

    if (error) {
      // No active avatar found - that's okay, we'll use defaults
      console.log("No active avatar found, using defaults");
      return;
    }

    if (data) {
      setSkinToneId(data.skin_tone_id);
      setFaceId(data.face_id);
      setHairId(data.hair_id);
      setHairColorId(data.hair_color_id);
      setOutfitId(data.outfit_id);
      setAccessoryId(data.accessory_id || ACCESSORY_OPTIONS[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeProfileId) {
      alert("No active profile selected");
      return;
    }

    setSaving(true);

    const supabase = supabaseBrowser();

    // Step 1: Set all existing avatars for this profile to is_active=false
    const { error: updateError } = await supabase
      .from("avatars")
      .update({ is_active: false })
      .eq("profile_id", activeProfileId);

    if (updateError) {
      alert(`Error updating existing avatars: ${updateError.message}`);
      setSaving(false);
      return;
    }

    // Step 2: Insert new avatar with is_active=true
    const newAvatar: Omit<Avatar, "id"> = {
      profile_id: activeProfileId,
      skin_tone_id: skinToneId,
      face_id: faceId,
      hair_id: hairId,
      hair_color_id: hairColorId,
      outfit_id: outfitId,
      accessory_id: accessoryId,
      is_active: true,
    };

    const { error: insertError } = await supabase
      .from("avatars")
      .insert(newAvatar);

    if (insertError) {
      alert(`Error creating avatar: ${insertError.message}`);
      setSaving(false);
      return;
    }

    alert("Avatar saved successfully!");
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!activeProfileId) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Avatar Builder</h1>
        <p>No active profile selected. Please select a profile first.</p>
        <a href="/profiles" style={{ color: "blue", textDecoration: "underline" }}>
          Go to Profiles
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Avatar Builder</h1>
      
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="skinTone" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Skin Tone (required):
          </label>
          <select
            id="skinTone"
            value={skinToneId}
            onChange={(e) => setSkinToneId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          >
            {SKIN_TONE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="face" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Face (required):
          </label>
          <select
            id="face"
            value={faceId}
            onChange={(e) => setFaceId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          >
            {FACE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="hair" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Hair (required):
          </label>
          <select
            id="hair"
            value={hairId}
            onChange={(e) => setHairId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          >
            {HAIR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="hairColor" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Hair Color (required):
          </label>
          <select
            id="hairColor"
            value={hairColorId}
            onChange={(e) => setHairColorId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          >
            {HAIR_COLOR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="outfit" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Outfit (required):
          </label>
          <select
            id="outfit"
            value={outfitId}
            onChange={(e) => setOutfitId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          >
            {OUTFIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="accessory" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Accessory (optional):
          </label>
          <select
            id="accessory"
            value={accessoryId}
            onChange={(e) => setAccessoryId(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          >
            {ACCESSORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 20px",
            backgroundColor: saving ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Avatar"}
        </button>
      </form>
    </div>
  );
}
