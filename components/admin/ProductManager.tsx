import React, { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import type { Product } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, XIcon } from '../Icons';

const ProductModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    product: Product | null;
}> = ({ isOpen, onClose, onSave, product }) => {
    const [formData, setFormData] = useState<Product>({ id: '', name: '', rate: 0, unit: '', category: '', image: '' });

    useEffect(() => {
        setFormData(product || { id: '', name: '', rate: 0, unit: 'pcs', category: '', image: '' });
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'rate' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id || !formData.name || !formData.category) {
            alert('SKU, Name, and Category are required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose}><XIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">SKU / ID *</label>
                        <input type="text" name="id" value={formData.id} onChange={handleChange} disabled={!!product} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Rate (₹) *</label>
                            <input type="number" name="rate" value={formData.rate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Unit *</label>
                            <input type="text" name="unit" value={formData.unit} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Category *</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Image URL</label>
                        <input type="text" name="image" value={formData.image} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="pt-4 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProductManager: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = (product: Product) => {
        if (editingProduct) {
            updateProduct(product);
        } else {
            addProduct(product);
        }
        handleCloseModal();
    };

    const handleDelete = (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            deleteProduct(productId);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Product
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img src={product.image || 'https://placehold.co/40'} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">₹{product.rate.toFixed(2)} / {product.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => handleOpenModal(product)} className="text-indigo-600 hover:text-indigo-900 p-1"><EditIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 p-1"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
                product={editingProduct}
            />
        </div>
    );
};

export default ProductManager;
