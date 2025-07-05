import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/entities/Product";
import ProductForm from "./ProductForm";

export default function ProductEditDialog({ product, open, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (productData) => {
    setIsLoading(true);
    try {
      await Product.update(product.id, productData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Produto</DialogTitle>
        </DialogHeader>
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitText="Atualizar Produto"
        />
      </DialogContent>
    </Dialog>
  );
}