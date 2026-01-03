import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import {
  CircleAlert,
  ImageIcon,
  Sparkles,
  UserRound,
  XIcon,
} from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import Button from "@/shared/ui/Button";

interface GuideModalProps {
  open: boolean;
  closeModal: () => void;
}

export default function GuideModal({ open, closeModal }: GuideModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeModal();
      }}
    >
      <DialogContent className="sm:w-[500px]" showCloseButton={false}>
        <DialogHeader className="relative">
          <DialogTitle className="mx-auto text-xl mb-3 text-center">
            Короткое руководство
          </DialogTitle>

          <DialogClose
            className="absolute cursor-pointer top-0 right-0 focus:outline-none focus:ring-0"
            onClick={closeModal}
          >
            <XIcon size={24} />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="space-y-3 text-sm leading-6 text-base-content/90">
            <li className="flex items-start gap-3">
              <ImageIcon className="h-5 min-h-5 w-5 min-w-5 opacity-80" />
              <p>
                <span className="font-medium">Референс</span> лучше загружать в
                хорошем качестве — так нейросеть лучше распознаёт стиль, и
                перенос получается корректнее.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <UserRound className="h-5 min-h-5 w-5 min-w-5 opacity-80" />
              <p>
                Для лучшего сходства постарайтесь выбрать{" "}
                <span className="font-medium">
                  похожий ракурс и выражение лица
                </span>
                , как на референсе.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="h-5 min-h-5 w-5 min-w-5 opacity-80" />
              <p>
                Чем ближе{" "}
                <span className="font-medium">поза и телосложение</span> на
                референсе к вашему, тем естественнее будет результат.
              </p>
            </li>

            <li className="flex items-start gap-3">
              <CircleAlert className="h-5 min-h-5 w-5 min-w-5 opacity-80" />
              <div className="space-y-2">
                <p>
                  Если кажется, что{" "}
                  <span className="font-medium">
                    стиль просто наложился поверх лица
                  </span>{" "}
                  или{" "}
                  <span className="font-medium">
                    результат не отличается от референса
                  </span>
                  :
                </p>

                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    попробуйте другое исходное фото —{" "}
                    <span className="font-medium">с другим освещением</span> или{" "}
                    <span className="font-medium">ракурсом</span>
                  </li>
                  <li>или попробуйте использовать другой референс</li>
                </ul>
              </div>
            </li>
          </ul>

          <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-sm leading-6">
            <div className="flex items-start gap-2">
              <CircleAlert
                className="h-5 min-h-5 w-5 min-w-5 opacity-80"
                stroke="var(--color-error)"
              />
              <p className="text-base-content/90">
                Иногда нейросеть может некорректно обрабатывать отдельные лица —
                в таких случаях результат может не улучшаться, даже если менять
                референс и ракурс.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={closeModal} size="sm" color="ghost" type="button">
              Понятно
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
