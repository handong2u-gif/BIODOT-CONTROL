
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortableProductRowProps {
    id: number | string;
    children: React.ReactNode;
    isAdmin: boolean;
    onClick?: () => void;
    isReorderMode?: boolean;
}

export function SortableProductRow({ id, children, isAdmin, onClick, isReorderMode = true }: SortableProductRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        disabled: !isReorderMode
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : "auto",
        position: isDragging ? "relative" as const : undefined,
    };

    if (!isAdmin) {
        return (
            <tr
                className="hover:bg-slate-50/80 transition-colors group text-slate-700 cursor-pointer border-b"
                onClick={onClick}
            >
                {children}
            </tr>
        );
    }

    // 4. Render Row
    return (
        <tr
            ref={isReorderMode ? setNodeRef : undefined}
            style={isReorderMode ? style : undefined}
            className={`hover:bg-slate-50/80 transition-colors group text-slate-700 cursor-pointer border-b ${isDragging ? "bg-slate-100 shadow-md" : ""}`}
            onClick={onClick}
        >
            <td className="w-[40px] px-2 text-center">
                {isReorderMode ? (
                    <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none focus:outline-none"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="w-8 h-8" />
                )}
            </td>
            {children}
        </tr>
    );
}
