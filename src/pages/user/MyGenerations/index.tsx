import { useEffect, useState } from "react";
import ImageWithLoader from "@/shared/ui/ImageWithLoader";
import Loader from "@/shared/ui/Loader";
import {
  apiGetLastGenerations,
  ModelJobWithPreviewFile,
} from "@/api/modules/model-job";
import { useNavigate } from "react-router-dom";
import NotFound from "@/shared/ui/NotFound";

export default function MyGenerations() {
  const [items, setItems] = useState<ModelJobWithPreviewFile[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await apiGetLastGenerations();
        if (mounted) setItems(res ?? []);
      } catch (err) {
        console.error("Failed to load generations", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  if (!items.length) {
    return <NotFound enableDescription={false} />;
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Мои генерации</h1>

      {/* Masonry */}
      <div
        className="
          columns-2
          sm:columns-3
          lg:columns-4
          gap-4
        "
      >
        {items.map((item) => (
          <div key={item.id} className="break-inside-avoid mb-4">
            <ImageWithLoader
              src={item.outputPreviewFileUrl}
              alt=""
              size="md"
              widthPx={item.outputPreviewFile?.widthPx}
              heightPx={item.outputPreviewFile?.heightPx}
              className="rounded-xl shadow-sm bg-base-200 w-full cursor-pointer
              hover:scale-105 transition-transform duration-300"
              onClick={() => navigate(`/model-job/${item.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
