import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { addCategory, getAllCategories } from '../../../../service/Category';
import { storage } from '../../../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './add-category.css'

const forbiddenWords = ['Chết', 'Ma Túy', 'Khùng'];

const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const normalizeText = (text) => {
    return removeAccents(text).toLowerCase().replace(/\s+/g, '');
};

const containsForbiddenWords = (value) => {
    const normalizedValue = normalizeText(value);
    return forbiddenWords.some(word => normalizedValue.includes(normalizeText(word)));
};

const AddCategory = () => {
    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm();
    const [loading, setLoading] = useState(false);
    const [existingCategories, setExistingCategories] = useState([]);
    const [categoryNameError, setCategoryNameError] = useState('');
    const [categoryDescriptionError, setCategoryDescriptionError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAllCategories();
                setExistingCategories(response.data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleNameChange = (event) => {
        const value = event.target.value;
        if (containsForbiddenWords(value)) {
            setCategoryNameError('Tên danh mục chứa từ cấm');
        } else {
            setCategoryNameError('');
        }
    };

    const handleDescriptionChange = (event) => {
        const value = event.target.value;
        if (containsForbiddenWords(value)) {
            setCategoryDescriptionError('Mô tả chứa từ cấm');
        } else {
            setCategoryDescriptionError('');
        }
    };

    const uploadImage = async (image) => {
        const imageRef = ref(storage, `categories/${image.name}`);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);
        return imageUrl;
    };

    const validateFile = (file) => {
        if (!file) return 'Hình ảnh là bắt buộc';
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) return 'Vui lòng chọn file hình ảnh hợp lệ (JPEG, PNG, GIF)';
        return true;
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const validationResult = validateFile(file);
        if (validationResult !== true) {
            setError('categoryImage', { type: 'manual', message: validationResult });
        } else {
            clearErrors('categoryImage');
        }
    };

    const onSubmit = async (data) => {
        if (categoryNameError || categoryDescriptionError) {
            toast.error('Vui lòng sửa lỗi trước khi lưu.');
            return;
        }

        setLoading(true);
        try {
            const duplicateCategory = existingCategories.find(
                (category) => category.name.toLowerCase() === data.categoryName.toLowerCase()
            );
            if (duplicateCategory) {
                setError('categoryName', { type: 'manual', message: 'Tên danh mục đã tồn tại' });
                setLoading(false);
                return;
            }

            const fileValidationError = validateFile(data.categoryImage[0]);
            if (fileValidationError !== true) {
                setError('categoryImage', { type: 'manual', message: fileValidationError });
                setLoading(false);
                return;
            }

            const imageUrl = await uploadImage(data.categoryImage[0]);
            const categoryData = {
                name: data.categoryName,
                image: imageUrl,
                description: data.categoryDescription,
                type: data.categoryType
            };
            await addCategory(categoryData);

            toast.success('Danh mục đã được thêm thành công!', { position: "top-right", autoClose: 3000 });
            setTimeout(() => navigate('/categories'), 3000);
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Đã xảy ra lỗi khi thêm danh mục.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <ToastContainer />
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><a href="/categories" className='text-dark'>Danh mục</a></li>
                    <li className="breadcrumb-item active" aria-current="page">Thêm danh mục</li>
                </ol>
            </nav>
            <div className="row">
                <h3>Thêm danh mục</h3>
                <div className="card-body" style={{ padding: "0 3rem" }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-0">
                            <label htmlFor="categoryName" className="form-label">Tên danh mục</label>
                            <input
                                type="text"
                                className="form-control"
                                id="categoryName"
                                {...register('categoryName', { required: 'Tên danh mục là bắt buộc' })}
                                onChange={(e) => {
                                    handleNameChange(e);
                                }}
                            />
                            {categoryNameError && <p className="text-danger">{categoryNameError}</p>}
                            {errors.categoryName && <p className="text-danger">{errors.categoryName.message}</p>}
                        </div>
                        <div className="mb-0">
                            <label htmlFor="categoryImage" className="form-label">Hình ảnh</label>
                            <input
                                type="file"
                                className="form-control"
                                id="categoryImage"
                                {...register('categoryImage', { required: 'Hình ảnh là bắt buộc' })}
                                onChange={handleFileChange}
                                accept="image/jpeg, image/png, image/gif"
                            />
                            {errors.categoryImage && <p className="text-danger">{errors.categoryImage.message}</p>}
                        </div>
                        <div className="mb-0">
                            <label htmlFor="categoryDescription" className="form-label">Mô tả</label>
                            <textarea
                                id="categoryDescription"
                                className="form-control"
                                {...register('categoryDescription', { required: 'Mô tả là bắt buộc' })}
                                onChange={(e) => {
                                    handleDescriptionChange(e);
                                }}
                            ></textarea>
                            {categoryDescriptionError && <p className="text-danger">{categoryDescriptionError}</p>}
                            {errors.categoryDescription && <p className="text-danger">{errors.categoryDescription.message}</p>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="categoryType" className="form-label">Phân loại</label>
                            <select
                                id="categoryType"
                                className="form-select"
                                {...register('categoryType', { required: 'Phân loại là bắt buộc' })}
                            >
                                <option value="income">Thu nhập</option>
                                <option value="expense">Chi tiêu</option>
                            </select>
                            {errors.categoryType && <p className="text-danger">{errors.categoryType.message}</p>}
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCategory;
