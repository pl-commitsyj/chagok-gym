import type { Exercise } from '../model';
export function EquipmentPhoto({
  exercise: e,
  image,
  onOpen,
}: {
  exercise: Exercise;
  image?: string;
  onOpen: () => void;
}) {
  if (!image) return null;
  return (
    <details className="equipmentDetails">
      <summary>
        내 기구 사진 보기 <span>＋</span>
      </summary>
      <figure className="equipmentPhoto">
        <button
          className="photoButton"
          onClick={onOpen}
          aria-label={`${e.name} 내 사진 확대`}
        >
          <img src={image} alt={`${e.name} 직접 등록한 사진`} loading="lazy" />
          <span>사진 확대 ⤢</span>
        </button>
      </figure>
    </details>
  );
}
