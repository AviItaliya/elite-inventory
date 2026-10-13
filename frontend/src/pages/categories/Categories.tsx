import { useEffect, useState } from "react"
import { Edit, PlusCircle, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCategories, removeCategory } from "../../store/slices/categorySlice";


const Categories = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const user = useAppSelector((state) => state.auth.user);
    const {categories, loading, error} = useAppSelector((state) => state.category);  
    const [deleteError, setDeleteError] = useState("");

    const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";
    const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER";
    const canDelete = user?.role === "ADMIN";

    useEffect(() => {
        void dispatch(fetchCategories());
    }, [dispatch]);

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this category?");
        if(!confirmed) {
            return;
        }
        try {
            setDeleteError("");
            await dispatch(removeCategory(id)).unwrap();
        } catch (error) {
            console.error("Failed to delete category:", error);
            setDeleteError("Failed to delete category. It may be used by existing products.");
        }
    };

    if(loading) {
        return (
        <div className="categories-page">
            <Loading />
        </div>
    );
    }

    if(error) {
        return (
        <div className="categories-page">
            <ErrorMessage message={error} />
        </div>
    );
    }   

  return (
    <div className="categories-page">
        <div className="categories-page__header">
            <div>
                <h1>Categories</h1>
                <p>Manage your product categories.</p>
            </div>
            {canCreate && (<button type="button" className="btn btn--primary" onClick={() => navigate("/categories/create")}><PlusCircle size={18}/> Add Category</button>)}
        </div>

        <div className="categories-card">
            {deleteError && (
                <ErrorMessage message={deleteError} />
            )}
            <table className="categories-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Created At</th>
                        {user?.role === "ADMIN" && "MANAGER" && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <tr key={category.id}>
                            <td>{category.name}</td>
                            <td>
                                {new Date(category.createdAt).toLocaleDateString()}
                            </td>
                            {user?.role === "ADMIN" && "MANAGER" &&  <td>
                                {canEdit && (<button type="button" onClick={() => navigate(`/categories/${category.id}/edit`)} ><Edit size={18} color="blue"/></button>)}
                                {canDelete && (<button type="button" onClick={() => handleDelete(category.id)}><Trash size={18} color="red"/></button>)}
                            </td>}
                           
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}

export default Categories