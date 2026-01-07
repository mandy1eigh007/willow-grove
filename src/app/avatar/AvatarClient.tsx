"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";

// Fixed option sets for avatar attributes (v1 placeholder IDs)
const SKIN_TONE_OPTIONS = ["skin_1", "skin_2", "skin_3", "skin_4", "skin_5"];
const FACE_OPTIONS = ["face_1", "face_2", "face_3", "face_4", "face_5"];
const HAIR_OPTIONS = ["hair_1", "hair_2", "hair_3", "hair_4", "hair_5"];
const HAIR_COLOR_OPTIONS = ["black", "brown", "blonde", "red", "gray"];
const OUTFIT_OPTIONS = ["outfit_1", "outfit_2", "outfit_3", "outfit_4", "outfit_5"];
const ACCESSORY_OPTIONS = ["none", "accessory_1", "accessory_2", "accessory_3", "accessory_4"];

export default function AvatarClient() {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [skinToneId, setSkinToneId] = useState(SKIN_TONE_OPTIONS[0]);
  const [faceId, setFaceId] = useState(FACE_OPTIONS[0]);
  const [hairId, setHairId] = useState(HAIR_OPTIONS[0]);
  const [hairColorId, setHairColorId] = useState(HAIR_COLOR_OPTIONS[0]);
  const [outfitId, setOutfitId] = useState(OUTFIT_OPTIONS[0]);
  const [accessoryId, setAccessoryId] = useState(ACCESSORY_OPTIONS[0]); // "none" means null in DB

  useEffect(() => {
    const load = async () => {
      try {
        const profileId = localStorage.getItem("willow_active_profile_id");
        setActiveProfileId(profileId);

        if (profileId) {
          await loadCurrentAvatar(profileId);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCurrentAvatar(profileId: string) {
    const supabase = supabaseBrowser();

    // maybeSingle() avoids "no rows" errors
    const { data, error } = await supabase
      .from("avatars")
      .select("skin_tone_id, face_id, hair_id, hair_color_id, outfit_id, accessory_id")
      .eq("profile_id", profileId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error loading avatar:", error);
      return;
    }

    if (!data) return;

    setSkinToneId(data.skin_tone_id);
    setFaceId(data.face_id);
    setHairId(data.hair_id);
    setHairColorId(data.hair_color_id);
    setOutfitId(data.outfit_id);

    // If DB is null, show "none"
    setAccessoryId(data.accessory_id ?? "none");
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!activeProfileId) {
      alert("No active profile selected.");
      return;
    }

    setSaving(true);
    const supabase = supabaseBrowser();

    try {
      // 1) Deactivate existing avatars for this profile
      const { error: updateError } = await supabase
        .from("avatars")
        .update({ is_active: false })
        .eq("profile_id", activeProfileId);

      if (updateError) throw updateError;

      // 2) Insert new active avatar
      const accessoryOrNull = accessoryId === "none" ? null : accessoryId;

      const { error: insertError } = await supabase.from("avatars").insert({
        profile_id: activeProfileId,
        skin_tone_id: skinToneId,
        face_id: faceId,
        hair_id: hairId,
        hair_color_id: hairColorId,
        outfit_id: outfitId,
        accessory_id: accessoryOrNull,
        is_active: true,
      });

      if (insertError) throw insertError;

      alert("Avatar saved.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Error saving avatar: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!activeProfileId) {
    return (
      <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
        <h1>Avatar Builder</h1>
        <p>No active profile selected. Select a profile first.</p>
        <Link href="/profiles" style={{ textDecoration: "underline" }}>
          Go to Profiles
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>Avatar Builder</h1>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: 15 }}>
          <label htmlFor="skinTone" style={{ display: "block", marginBottom: 5, fontWeight: 600 }}>
            Skin Tone (required)
          </label>
          <select
            id="skinTone"
            value={skinToneId}
            onChange={(e) => setSkinToneId(e.target.value)}
            required
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          >
            {SKIN_TONE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label htmlFor="face" style={{ display: "block", marginBottom: 5, fontWeight: 600 }}>
            Face (required)
          </label>
          <select
            id="face"
            value={faceId}
            onChange={(e) => setFaceId(e.target.value)}
            required
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          >
            {FACE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label htmlFor="hair" style={{ display: "block", marginBottom: 5, fontWeight: 600 }}>
            Hair (required)
          </label>
          <select
            id="hair"
            value={hairId}
            onChange={(e) => setHairId(e.target.value)}
            required
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          >
            {HAIR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label htmlFor="hairColor" style={{ display: "block", marginBottom: 5, fontWeight: 600 }}>
            Hair Color (required)
          </label>
          <select
            id="hairColor"
            value={hairColorId}
            onChange={(e) => setHairColorId(e.target.value)}
            required
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          >
            {HAIR_COLOR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label htmlFor="outfit" style={{ display: "block", marginBottom: 5, fontWeight: 600 }}>
            Outfit (required)
          </label>
          <select
            id="outfit"
            value={outfitId}
            onChange={(e) => setOutfitId(e.target.value)}
            required
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          >
            {OUTFIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label htmlFor="accessory" style={{ display: "block", marginBottom: 5, fontWeight: 600 }}>
            Accessory (optional)
