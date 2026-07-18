import {
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type UniqueIdentifier,
} from '@dnd-kit/core';

/**
 * 다중 컨테이너 sortable용 충돌 감지.
 * 조/대기열로 옮기면서, 같은 조 안에서는 카드 단위로 순서를 잡습니다.
 */
export function createSortableCollisionDetection(
  containerIds: UniqueIdentifier[],
  items: Record<string, string[]>,
  activeId: UniqueIdentifier | null,
): CollisionDetection {
  const containers = new Set(containerIds.map(String));
  let lastOverId: UniqueIdentifier | null = null;

  return (args) => {
    if (activeId && containers.has(String(activeId))) {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((container) =>
          containers.has(String(container.id)),
        ),
      });
    }

    const pointerCollisions = pointerWithin(args);
    const collisions =
      pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);

    let overId = getFirstCollision(collisions, 'id');

    if (overId != null) {
      if (containers.has(String(overId))) {
        const containerItems = items[String(overId)] ?? [];

        if (containerItems.length > 0) {
          const closest = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.id !== overId &&
                containerItems.includes(String(container.id)),
            ),
          });

          overId = closest[0]?.id ?? overId;
        }
      }

      lastOverId = overId;
      return [{ id: overId }];
    }

    return lastOverId ? [{ id: lastOverId }] : [];
  };
}
