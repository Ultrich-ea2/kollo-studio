export type PresenterSlide = {
  title: string;
  svg: string;
  notes: string;
  transition: string;
  reveal: boolean;
  seconds: number;
};
export type PresenterOptions = {
  slides: PresenterSlide[];
  title: string;
  duration: number;
  css: string;
  start?: number;
  onClose?: () => void;
};
export function mountPresenter(
  root: HTMLElement,
  options: PresenterOptions,
): () => void;
