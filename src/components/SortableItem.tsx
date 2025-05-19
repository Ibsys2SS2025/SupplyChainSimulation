import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem({
                                         id,
                                         children,
                                         className,
                                     }: {
    id: string;
    children: React.ReactNode;
    className?: string;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={className}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    );
}

