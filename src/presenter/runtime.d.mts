export type PresenterSlide = {
  title: string;
  svg: string;
  notes: string;
  transition: string;
  reveal: boolean;
  seconds: number;
  media?: {
    start: number;
    starts?: number[];
    stops: number[];
    labels: string[];
  };
};
export type PresenterOptions = {
  slides: PresenterSlide[];
  title: string;
  duration: number;
  css: string;
  start?: number;
  showNotes?: boolean;
  media?: { src: string; poster?: string };
  onClose?: () => void;
};
export function mountPresenter(
  root: HTMLElement,
  options: PresenterOptions,
): () => void;
