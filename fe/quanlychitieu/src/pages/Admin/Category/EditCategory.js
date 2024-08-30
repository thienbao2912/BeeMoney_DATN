import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategoryById, updateCategory } from '../../../service/CategorieAdmin';
import { useForm } from 'react-hook-form';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';
import Layout from '../../../layouts/AdminLayout';

const forbiddenWords = ['Chết', 'Ma Túy', 'Khùng']; // Add forbidden words here

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const normalizeText = (text) => {
  return removeAccents(text).toLowerCase().replace(/\s+/g, ''); // Remove spaces
};

const containsForbiddenWords = (value) => {
  const normalizedValue = normalizeText(value);
  return forbiddenWords.some(word => normalizedValue.includes(normalizeText(word)));
};

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [error, setError] = useState(null);
    const [image, setImage] = useState(null);
    const [currentImage, setCurrentImage] = useState('');

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await getCategoryById(id, navigate);
                setValue('name', response.name);
                setValue('type', response.type);
                setValue('description', response.description);
                setCurrentImage(response.image || '');
            } catch (err) {
                setError('Failed to fetch category.');
                console.error('Fetch category error:', err);
            }
        };

        fetchCategory();
    }, [id, navigate, setValue]);

    const onSubmit = async (data) => {
        try {
            let imageUrl = currentImage;
            if (image) {
                const imageRef = ref(storage, `categories/${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }

            const categoryData = { ...data, image: imageUrl };
            await updateCategory(id, categoryData, navigate);
            navigate('/admin/categories');
        } catch (err) {
            console.error('Update category error:', err);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Layout>
            <div className="container">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h1 className="card-title">Sửa loại</h1>
                    <button onClick={handleBack} className="btn btn-secondary">Quay lại</button>
                </div>
                {error && <p>{error}</p>}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Tên</label>
                        <input
                            type="text"
                            id="name"
                            {...register('name', {
                                required: 'Tên danh mục là bắt buộc',
                                validate: value => 
                                  !containsForbiddenWords(value) || 'Tên danh mục chứa từ cấm',
                              })}
                            className="form-control"
                        />
                        {errors.name && (
                            <small className='text-danger'>
                                {errors.name.message}
                            </small>
                        )}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="type" className="form-label">Loại</label>
                        <input
                            type="text"
                            id="type"
                            {...register('type', { required: 'Loại là bắt buộc' })}
                            className="form-control"
                        />
                        {errors.type && (
                            <small className='text-danger'>
                                {errors.type.message}
                            </small>
                        )}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Ghi chú</label>
                        <textarea
                            id="description"
                            {...register('description')}
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="image" className="form-label">Hình ảnh</label>
                        {currentImage && <img src={currentImage} alt="Current" style={{ width: '100px' }} />}
                        <input
                            type="file"
                            id="image"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="form-control"
                        />
                        {errors.image && (
                            <small className='text-danger'>
                                {errors.image.message}
                            </small>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary">Lưu</button>
                </form>
            </div>
        </Layout>
    );
};

export default EditCategory;
