import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, Trash2, Upload, X, RotateCcw } from "lucide-react";

interface ProductImageEditorProps {
  imageUrl?: string | null;
  onFileSelected?: (file: File | null) => void;
  onRemoveChange?: (remove: boolean) => void;
  disabled?: boolean;
}

const ProductImageEditor = ({
  imageUrl,
  onFileSelected,
  onRemoveChange,
  disabled = false,
}: ProductImageEditorProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");

  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const clearPreview = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelected?.(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    clearPreview();

    const objectUrl = URL.createObjectURL(file);

    previewRef.current = objectUrl;

    setSelectedFile(file);
    setPreviewUrl(objectUrl);

    // Selecting a new image cancels pending removal.
    setRemoveImage(false);
    onRemoveChange?.(false);

    onFileSelected?.(file);
  };

  const handleCancelSelection = () => {
    clearPreview();
    setError("");
  };

  const handleRemoveImage = () => {
    clearPreview();

    setRemoveImage(true);
    onRemoveChange?.(true);

    setError("");
  };

  const handleUndoRemove = () => {
    setRemoveImage(false);
    onRemoveChange?.(false);
  };

  const displayedImage =
    previewUrl ?? (removeImage ? null : (imageUrl ?? null));

  return (
    <div className="product-image-editor">
      <div className="product-image-editor__preview">
        {displayedImage ? (
          <img
            src={displayedImage}
            alt="Product"
            className="product-image-editor__image"
          />
        ) : (
          <div className="product-image-editor__placeholder">
            <ImagePlus size={36} />
            <span>No product image</span>
          </div>
        )}
      </div>

      <div className="product-image-editor__content">
        <h3>Product Image</h3>

        <p>Upload a JPG, PNG or WebP image. Maximum size: 5 MB.</p>

        <label className="btn btn--secondary product-image-editor__select">
          <Upload size={16} />

          <span>{imageUrl ? "Choose New Image" : "Choose Image"}</span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={disabled}
            hidden
          />
        </label>

        {selectedFile && (
          <div className="product-image-editor__selected">
            <span>{selectedFile.name}</span>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleCancelSelection}
              disabled={disabled}
            >
              <X size={15} />
              Cancel Selection
            </button>
          </div>
        )}

        {imageUrl && !removeImage && !selectedFile && (
          <button
            type="button"
            className="btn btn--danger"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <Trash2 size={16} />
            Remove Image
          </button>
        )}

        {removeImage && (
          <div className="product-image-editor__selected">
            <span>Image will be removed when you save.</span>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleUndoRemove}
              disabled={disabled}
            >
              <RotateCcw size={15} />
              Undo
            </button>
          </div>
        )}

        {selectedFile && (
          <p className="product-image-editor__success">
            Image will be uploaded when you save the product.
          </p>
        )}

        {error && (
          <p className="product-image-editor__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductImageEditor;
