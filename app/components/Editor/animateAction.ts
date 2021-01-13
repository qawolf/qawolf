type AnimateAction = {
  id: string;
  removeAction: (id: string) => void;
  x: number;
  y: number;
};

type GetAnimationDuration = {
  targetX: number;
  targetY: number;
  x: number;
  y: number;
};

type ShrinkAction = {
  duration: number;
  id: string;
};

const ACTION_SIZE = "38px";

const shrinkAction = ({ duration, id }: ShrinkAction): void => {
  document.querySelector(`#${id} .action-code`)?.animate(
    [
      {
        transform: "scale(1)",
        offset: 0,
      },
      {
        transform: "scale(0)",
        offset: 1,
      },
    ],
    { duration }
  );
};

const getAnimationDuration = ({
  targetX,
  targetY,
  x,
  y,
}: GetAnimationDuration): number => {
  const xs = (targetX - x) * (targetX - x);
  const ys = (targetY - y) * (targetY - y);
  const distance = Math.sqrt(xs + ys);

  if (isNaN(distance)) return 0;

  return Math.max(distance * 1.36, 0);
};

export const animateAction = ({
  id,
  removeAction,
  x,
  y,
}: AnimateAction): void => {
  const action = document.getElementById(id);
  const viewCode = document.getElementById("code");
  if (!action || !viewCode) return;

  const { left, top } = viewCode.getBoundingClientRect();
  const targetX = left + viewCode.clientWidth / 2;
  const targetY = top + viewCode.clientHeight / 2;

  action.style.height = ACTION_SIZE;
  action.style.left = `calc(${x}px - ${ACTION_SIZE} / 2)`;
  action.style.top = `calc(${y}px - ${ACTION_SIZE} / 2)`;
  action.style.width = ACTION_SIZE;

  const duration = getAnimationDuration({ targetX, targetY, x, y });

  const animation = action.animate(
    [
      {
        transform: "translate(0, 0)",
        offset: 0,
      },
      {
        transform: `translate(${targetX - x}px, ${targetY - y}px)`,
        offset: 1,
      },
    ],
    { duration }
  );

  shrinkAction({ duration, id });

  animation.onfinish = () => {
    removeAction(id);
  };
};
