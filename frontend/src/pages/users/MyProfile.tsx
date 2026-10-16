import { useRef, useState } from "react";
import { Camera, Mail, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { profileUpdated } from "../../store/slices/authSlice";
import {
  removeMyProfileImage,
  uploadMyProfileImage,
} from "../../services/authService";

type ProfileUser = {
  name: string;
  role: string;
  imageUrl?: string | null;
  email: string;
  isActive?: boolean;
  createdAt?: string | number | Date;
};

export default function MyProfile() {
  const user = useAppSelector(
    (state) => (state as { auth: { user: ProfileUser | null } }).auth.user,
  );
  const dispatch = useAppDispatch();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  if (!user) return <p>Loading profile...</p>;
  const upload = async (file?: File) => {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Use JPG, PNG or WebP under 5 MB.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      dispatch(profileUpdated(await uploadMyProfileImage(file)));
      setNotice("Profile photo updated.");
    } catch {
      setError("Couldn't save your profile photo. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      dispatch(profileUpdated(await removeMyProfileImage()));
      setNotice("Profile photo removed.");
    } catch {
      setError("Couldn't remove your profile photo.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="my-profile">
      <div className="my-profile__heading">
        <h1>My Profile</h1>
        <p>View your account information and manage your photo.</p>
      </div>
      <div className="my-profile__card">
        <div className="my-profile__cover" />
        <div className="my-profile__body">
          <div className="my-profile__avatar">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={`${user.name}'s profile`} />
            ) : (
              <span aria-label="Default profile avatar">
                {user.name?.trim().charAt(0).toUpperCase() || (
                  <UserRound size={35} />
                )}
              </span>
            )}
          </div>
          <h2>{user.name}</h2>
          <p className="my-profile__role">{user.role}</p>
          <div className="my-profile__buttons">
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              className="btn btn--primary"
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              <Camera size={17} />{" "}
              {busy
                ? "Saving..."
                : user.imageUrl
                  ? "Change photo"
                  : "Add photo"}
            </button>
            {user.imageUrl && (
              <button
                className="btn btn--danger"
                type="button"
                disabled={busy}
                onClick={() => void remove()}
              >
                <Trash2 size={17} /> Remove photo
              </button>
            )}
          </div>
          {error && (
            <p className="my-profile__error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="my-profile__success" role="status">
              {notice}
            </p>
          )}
          <div className="my-profile__details">
            <div>
              <Mail size={19} />
              <span>
                <small>Email address</small>
                <strong>{user.email}</strong>
              </span>
            </div>
            <div>
              <ShieldCheck size={19} />
              <span>
                <small>Account role</small>
                <strong>{user.role}</strong>
              </span>
            </div>
            <div>
              <UserRound size={19} />
              <span>
                <small>Account status</small>
                <strong>
                  {user.isActive === false ? "Inactive" : "Active"}
                </strong>
              </span>
            </div>
            {user.createdAt && (
              <div>
                <span>
                  <small>Member since</small>
                  <strong>
                    {new Date(user.createdAt).toLocaleDateString("en-IN")}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
