import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { addCategory, getAllCategories } from "../../../service/CategorieAdmin";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase";
import Layout from "../../../layouts/AdminLayout";

const forbiddenWords = ["Chết", "Ma Túy", "Khùng"]; // Add forbidden words here

const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const normalizeText = (text) => {
  return removeAccents(text).toLowerCase().replace(/\s+/g, ""); // Remove spaces
};

const containsForbiddenWords = (value) => {
  const normalizedValue = normalizeText(value);
  return forbiddenWords.some((word) =>
    normalizedValue.includes(normalizeText(word))
  );
};

const AddCategory = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const [image, setImage] = useState(null);
  const [existingCategoryNames, setExistingCategoryNames] = useState([]);
  const navigate = useNavigate();

  // Fetch existing category names
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        const categoryNames = response.data.map((category) =>
          category.name.toLowerCase()
        );
        setExistingCategoryNames(categoryNames);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    console.log("Submitting data:", data);

    // Kiểm tra xem có trùng tên danh mục hay không
    if (existingCategoryNames.includes(data.name.toLowerCase())) {
      setError("name", {
        type: "manual",
        message: "Tên danh mục đã tồn tại.",
      });
      return;
    }

    try {
      if (!image) {
        return;
      }

      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `categories/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const categoryData = { ...data, image: imageUrl };
      await addCategory(categoryData, navigate);
      navigate("/admin/categories");
    } catch (err) {
      console.error("Add category error:", err);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <div className="container-fluid py-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h1 className="card-title">Thêm mới loại</h1>
          <div className="">
            <button onClick={handleBack} className=" btn btn-secondary">
              Quay lại
            </button>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Tên
              </label>
              <input
                type="text"
                id="name"
                {...register("name", {
                  required: "Tên danh mục là bắt buộc",
                  validate: (value) =>
                    !containsForbiddenWords(value) ||
                    "Tên danh mục chứa từ cấm",
                })}
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
              />
              {errors.name && (
                <small className="text-danger">{errors.name.message}</small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">
                Loại
              </label>
              <select
                id="type"
                {...register("type", { required: "Loại là bắt buộc" })}
                className={`form-control ${errors.type ? "is-invalid" : ""}`}
              >
                <option value="">Chọn loại</option>
                <option value="Thu nhập">Thu nhập</option>
                <option value="Chi tiêu">Chi tiêu</option>
              </select>
              {errors.type && (
                <small className="text-danger">{errors.type.message}</small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Ghi chú
              </label>
              <textarea
                id="description"
                {...register("description", {
                  required: "Ghi chú là bắt buộc",
                  validate: (value) =>
                    !containsForbiddenWords(value) || "Ghi chú chứa từ cấm",
                })}
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">
                Hình ảnh
              </label>
              <input
                type="file"
                id="image"
                {...register("image", { required: "Hình ảnh là bắt buộc" })}
                onChange={(e) => setImage(e.target.files[0])}
                className={`form-control ${errors.image ? "is-invalid" : ""}`}
              />
              {errors.image && (
                <small className="text-danger">{errors.image.message}</small>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              Lưu
            </button>
          </form>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddCategory;
