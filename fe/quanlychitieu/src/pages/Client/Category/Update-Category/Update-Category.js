import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { editCategory, getCategoryById } from '../../../../service/Category';
import { useParams } from 'react-router-dom';
import { storage, ref, getDownloadURL } from '../../../../config/firebase';
import { useForm } from 'react-hook-form';

const EditCategory = () => {
    const { id } = useParams();
    const [isFetching, setIsFetching] = useState(false);
    const [response, setResponse] = useState(null);
    const [userId, setUserId] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitted, isSubmitting }
    } = useForm({
        defaultValues: {
            categoryName: '',
            categoryImage: '',
            categoryDescription: '',
            categoryType: '',
        }
    });

    const categoryImage = watch('categoryImage');

    const getImageUrl = async (imagePath) => {
        try {
            const imageRef = ref(storage, imagePath);
            const url = await getDownloadURL(imageRef);
            return url;
        } catch (error) {
            console.error('Error getting image URL:', error);
            throw error;
        }
    };

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        setUserId(storedUserId);

        const fetchCategory = async () => {
            setIsFetching(true);
            try {
                const { data } = await getCategoryById(storedUserId, id);
                const imageUrl = data.image ? await getImageUrl(data.image) : '';

                setValue('categoryName', data.name);
                setValue('categoryDescription', data.description);
                setValue('categoryType', data.type);
                setValue('categoryImage', imageUrl);
                setIsFetching(false);
            } catch (error) {
                setIsFetching(false);
                setResponse({ status: 'error', message: 'Không thể tải danh mục.' });
            }
        };

        fetchCategory();
    }, [id, setValue]);

    const onSubmit = async (data) => {
        setIsFetching(true);
        try {
            const categoryData = {
                name: data.categoryName,
                description: data.categoryDescription,
                type: data.categoryType,
                image: data.categoryImage,
            };
            await editCategory(userId, id, categoryData);
            setResponse({ status: 'success', message: 'Danh mục đã được cập nhật thành công!' });
        } catch (error) {
            setResponse({ status: 'error', message: 'Cập nhật danh mục thất bại.' });
        } finally {
            setIsFetching(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setValue('categoryImage', file);
    };

    return (
        <div className="container mt-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><a href="/categories" className='text-dark'>Danh mục</a></li>
                    <li className="breadcrumb-item active" aria-current="page">Sửa danh mục</li>
                </ol>
            </nav>
            {response && (
                <div className={`alert ${response.status === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {response.message}
                </div>
            )}
            {isFetching && (
                <div className="text-center mt-5">
                    <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                    <p className="mt-2 primary">Loading...</p>
                </div>
            )}
            {!isFetching && (
                <div className="row mt-3">
                    <div className="col-md-3">
                        {categoryImage && typeof categoryImage === 'string' && (
                            <img src={categoryImage} alt="category" className="img-fluid" />
                        )}
                    </div>
                    <div className="col-md-9">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-3">
                                <label htmlFor="categoryName" className="form-label">Tên danh mục</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="categoryName"
                                    {...register('categoryName', { required: 'Tên danh mục không được để trống' })}
                                />
                                {isSubmitted && errors.categoryName && (
                                    <span className="text-danger">{errors.categoryName.message}</span>
                                )}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="categoryImage" className="form-label">Hình ảnh</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="categoryImage"
                                    onChange={handleFileChange}
                                />
                                {categoryImage && typeof categoryImage === 'object' && categoryImage.size > 5 * 1024 * 1024 && (
                                    <div className="text-danger">Kích thước file quá lớn. Vui lòng tải file dưới 5MB</div>
                                )}
                                {categoryImage && typeof categoryImage === 'object' && !['image/jpeg', 'image/png', 'image/webp'].includes(categoryImage.type) && (
                                    <div className="text-danger">Chỉ chấp nhận file thuộc định dạng .jpeg, .jpg, .png, .webp</div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="categoryDescription" className="form-label">Mô tả</label>
                                <textarea
                                    id="categoryDescription"
                                    className="form-control"
                                    {...register('categoryDescription', { required: 'Mô tả không được để trống' })}
                                ></textarea>
                                {isSubmitted && errors.categoryDescription && (
                                    <span className="text-danger">{errors.categoryDescription.message}</span>
                                )}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="categoryType" className="form-label">Phân loại</label>
                                <select
                                    id="categoryType"
                                    className="form-select"
                                    {...register('categoryType', { required: 'Phân loại không được để trống' })}
                                >
                                    <option value="income">Thu nhập</option>
                                    <option value="expense">Chi tiêu</option>
                                </select>
                                {isSubmitted && errors.categoryType && (
                                    <span className="text-danger">{errors.categoryType.message}</span>
                                )}
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>Lưu</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditCategory;
