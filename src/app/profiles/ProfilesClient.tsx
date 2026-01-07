"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  age_mode: string;
  created_at: string;
};

type User = {
  id: string;
  email?: string;
};

type ProfilesClientProps = {
  profiles: Profile[];
  user: User;
};

export default function ProfilesClient({ profiles, user }: ProfilesClientProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [ageMode, setAgeMode] = useState("4–6");
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    setActiveProfileId(localStorage.getItem("willow_active_profile_id"));
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      alert("Please enter a display name");
      return;
    }

    const supabase = supabaseBrowser();
    
    const { error } = await supabase.from("profiles").insert({
      user_id: user.id,
      display_name: displayName.trim(),
      age_mode: ageMode,
    });

    if (error) {
      alert(`Error creating profile: ${error.message}`);
      return;
    }

    setDisplayName("");
    setAgeMode("4–6");
    router.refresh();
  };

  const handleSelectProfile = (profileId: string) => {
    localStorage.setItem("willow_active_profile_id", profileId);
    setActiveProfileId(profileId);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this profile?")) {
      return;
    }

    const supabase = supabaseBrowser();
    
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profileId);

    if (error) {
      alert(`Error deleting profile: ${error.message}`);
      return;
    }

    // Clear active profile if it was deleted
    if (activeProfileId === profileId) {
      localStorage.removeItem("willow_active_profile_id");
      setActiveProfileId(null);
    }

    router.refresh();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Profiles</h1>
      
      <div style={{ marginBottom: "30px" }}>
        <h2>Create New Profile</h2>
        <form onSubmit={handleCreateProfile}>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="displayName" style={{ display: "block", marginBottom: "5px" }}>
              Display Name:
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="ageMode" style={{ display: "block", marginBottom: "5px" }}>
              Age Mode:
            </label>
            <select
              id="ageMode"
              value={ageMode}
              onChange={(e) => setAgeMode(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            >
              <option value="4–6">4–6</option>
              <option value="7–9">7–9</option>
              <option value="10–12">10–12</option>
            </select>
          </div>
          
          <button type="submit" style={{ padding: "8px 16px" }}>
            Create Profile
          </button>
        </form>
      </div>

      <div>
        <h2>Your Profiles</h2>
        {profiles.length === 0 ? (
          <p>No profiles yet. Create one above!</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {profiles.map((profile) => (
              <li
                key={profile.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  marginBottom: "10px",
                  backgroundColor: activeProfileId === profile.id ? "#e8f4f8" : "white",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <strong>{profile.display_name}</strong> (Age: {profile.age_mode})
                </div>
                <div>
                  <button
                    onClick={() => handleSelectProfile(profile.id)}
                    style={{ marginRight: "10px", padding: "5px 10px" }}
                    disabled={activeProfileId === profile.id}
                  >
                    {activeProfileId === profile.id ? "Active" : "Select"}
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    style={{ padding: "5px 10px", backgroundColor: "#ffcccc" }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
