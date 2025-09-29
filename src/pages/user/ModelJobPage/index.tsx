import { apiUploadFile } from "@/api/files";
import { apiCreateModelJob } from "@/api/model-job";
import { apiGetPrompt, Prompt } from "@/api/prompts";
import Button from "@/shared/ui/Button";
import ImageUploader from "@/shared/ui/FilePondUploader";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";

const modelJobSchema = z.object({
  prompt: z.string().min(1, "Добавьте уточняющий промпт, если необходимо"),
  inputFileId: z.string().min(1, "Загрузите изображение"),
});

type ModelJobFormValues = z.infer<typeof modelJobSchema>;

type UploadResponse = { id?: string; key?: string };

export default function ModelJobPage() {
  const { promptId } = useParams<{
    promptId: string;
  }>();
  const navigate = useNavigate();

  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(null);
  const [isFetching, setIsFetching] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ModelJobFormValues>({
    resolver: zodResolver(modelJobSchema),
    defaultValues: {
      prompt: "",
      inputFileId: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    apiGetPrompt(promptId).then((res) => {
      setCurrentPrompt(res);
    });
  }, [promptId]);

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      await apiCreateModelJob({ ...data, model: "OPENAI" }).then((res) => {
        navigate(`/prompt/${promptId}/model-job/${res.id}`);
      });
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setIsFetching(false);
    }
  };

  const upload = async (file: File) => {
    const res = (await apiUploadFile(file)) as UploadResponse;
    const value = res.id;
    if (!value) throw new Error("Сервер не вернул id файла");
    return value;
  };

  const isBusy = isFetching || isSubmitting;

  return (
    <div className="mx-auto w-full p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-center">
          <div className="flex flex-col gap-4 w-[500px]">
            <ImageUploader
              control={control}
              name="inputFileId"
              label="Референс"
              onUpload={upload}
              className="w-full"
            />

            <label className="block w-full">
              <div className="mb-1 text-sm text-neutral-600">Промпт</div>
              <Controller
                control={control}
                name="prompt"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Введите уточняющий промпт, если необходимо"
                    aria-invalid={!!errors.prompt}
                    className="w-full rounded-md border border-neutral-300 p-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                )}
              />
              {errors.prompt && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.prompt.message}
                </p>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="submit" disabled={isBusy} className="px-6 w-[200px]">
            {isSubmitting
              ? "Обработка..."
              : isFetching
              ? "Загрузка..."
              : "Начать"}
          </Button>
        </div>
      </form>
    </div>
  );
}
