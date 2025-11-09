// components/category/CategoryEditor.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { SketchPicker, ColorResult } from "react-color";
import { Input } from "../ui/input";
import { Plus, Save, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Category } from "@/types/Category";
import { getContrastColor } from "@/lib/colorUtils";

const colorPresets: { name: string; color: string; textColor: string }[] = [
    { name: "Đỏ", color: "#ef4444", textColor: "#FFFFFF" },
    { name: "Vàng", color: "#eab308", textColor: "#000000" },
    { name: "Xanh lá", color: "#22c55e", textColor: "#FFFFFF" },
    { name: "Xanh dương", color: "#3b82f6", textColor: "#FFFFFF" },
    { name: "Tím", color: "#8b5cf6", textColor: "#FFFFFF" },
];

interface CategoryEditorProps {
    categories: Category[]; 
    onCategoriesUpdated: (updatedCategories: Category[]) => void;
}

const CategoryEditor: React.FC<CategoryEditorProps> = ({
    categories,
    onCategoriesUpdated,
}) => {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newBgColor, setNewBgColor] = useState("#3b82f6");
    const [newTextColor, setNewTextColor] = useState("#FFFFFF");
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

    useEffect(() => {
        setNewTextColor(getContrastColor(newBgColor));
    }, [newBgColor]);

    const addNewCategory = async () => {
        if (
            newCategoryName.trim() &&
            !categories.some((cat) => cat.name === newCategoryName.trim())
        ) {
            
            try {
                const response = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newCategoryName.trim(),
                        color: newBgColor,
                        textColor: newTextColor,
                    }),
                });

                if (response.ok) {
                    const newCategory = await response.json();
                    onCategoriesUpdated([...categories, newCategory]); 
                    setNewCategoryName("");
                    setNewBgColor("#3b82f6");
                    setNewTextColor("#FFFFFF");
                } else {
                    const errorText = await response.text();
                    alert(`Lỗi: ${errorText}`);
                }
            } catch (error) {
                console.error("Lỗi khi tạo category:", error);
                alert("Lỗi kết nối khi tạo category.");
            }

        } else if (newCategoryName.trim()) {
            alert("Tên danh mục này đã tồn tại.");
        }
    };
    const deleteCategory = async (nameToDelete: string) => {
        const categoryToDelete = categories.find(c => c.name === nameToDelete);

        if (!categoryToDelete || !categoryToDelete.id) {
            alert("Lỗi: Không tìm thấy category hoặc category thiếu ID.");
            return;
        }

        if (!confirm(`Bạn có chắc muốn xóa danh mục "${nameToDelete}"? \n(Các mục thời gian cũ sẽ bị mất danh mục này)`)) {
            return;
        }

        try {
            const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
                method: 'DELETE',
            });
        
            if (response.ok) {
                const newCategoriesList = categories.filter(
                    (cat) => cat.name !== nameToDelete
                );
                onCategoriesUpdated(newCategoriesList);
            } else {
                alert("Lỗi khi xóa category.");
            }
        } catch (error) {
            console.error("Lỗi kết nối khi xóa category:", error);
            alert("Lỗi kết nối khi xóa category.");
        }
    };
    const selectPreset = (preset: { color: string; textColor: string }) => {
        setNewBgColor(preset.color);
        setNewTextColor(preset.textColor);
    };

    return (
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Chỉnh sửa Danh mục
                </Button>
            </DialogTrigger>
            <DialogContent className="p-6 max-w-lg">
                <DialogHeader>
                    <DialogTitle>Quản lý Danh mục</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Tạo mới</TabsTrigger>
                        <TabsTrigger value="manage">Quản lý</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="create">
                        <div className="space-y-4 pt-4">
                            <div>
                                <Label>Tên danh mục</Label>
                                <Input
                                    type="text"
                                    className="flex-grow bg-muted mt-1"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Gợi ý cặp màu</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {colorPresets.map((preset) => (
                                        <Button
                                            key={preset.name}
                                            variant="outline"
                                            size="sm"
                                            className="flex gap-2"
                                            onClick={() => selectPreset(preset)}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full border"
                                                style={{ backgroundColor: preset.color }}
                                            />
                                            <span>{preset.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            
                            <hr className="border-border" />

                            <div>
                                <Label>Tùy chỉnh (Nâng cao)</Label>
                                <div className="flex gap-4 mt-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="h-16 flex-1 flex flex-col items-start"
                                            >
                                                <span className="text-xs text-muted-foreground">Màu nền</span>
                                                <div className="w-full h-8 rounded mt-1" style={{ backgroundColor: newBgColor }} />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent 
                                            className="w-auto p-0 z-[60]"
                                            side="left" 
                                            align="start"
                                            sideOffset={4}
                                        >
                                            <SketchPicker
                                                color={newBgColor}
                                                onChangeComplete={(color: ColorResult) =>
                                                    setNewBgColor(color.hex)
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    
                                    <div className="h-16 flex-1">
                                        <Label className="text-xs text-muted-foreground">Màu chữ</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Button
                                                variant={newTextColor === '#FFFFFF' ? 'default' : 'outline'}
                                                className="w-full h-8"
                                                onClick={() => setNewTextColor('#FFFFFF')}
                                            >
                                                Trắng
                                            </Button>
                                            <Button
                                                variant={newTextColor === '#000000' ? 'default' : 'outline'}
                                                className="w-full h-8"
                                                onClick={() => setNewTextColor('#000000')}
                                            >
                                                Đen
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={addNewCategory} className="w-full">
                                <Plus size={16} className="mr-2" />
                                Thêm danh mục
                            </Button>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="manage">
                        <div className="space-y-2 pt-4">
                            <div className="max-h-[400px] overflow-y-auto pr-2">
                                {categories.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Chưa có danh mục nào.
                                    </p>
                                )}
                                {categories.map((cat) => (
                                    <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-4 h-4 rounded-full border"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            <span style={{ 
                                                color: cat.textColor, 
                                                backgroundColor: cat.color, 
                                                padding: '2px 6px', 
                                                borderRadius: '4px' 
                                            }}>
                                                {cat.name}
                                            </span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => deleteCategory(cat.name)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

            </DialogContent>
        </Dialog>
    );
};

export default CategoryEditor;