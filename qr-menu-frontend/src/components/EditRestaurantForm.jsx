import { useState } from "react";

const EditRestaurantForm = ({ restaurant, onSave, onCancel }) => {
    const [editedRestaurant, setEditedRestaurant] = useState(restaurant);

    return (
        <div className="edit-form">
            <h3>Edit Restaurant</h3>
            <input
                type="text"
                value={editedRestaurant.restorantName || ""}
                onChange={(e) => setEditedRestaurant({ ...editedRestaurant, restorantName: e.target.value })}
                placeholder="Restaurant Name"
            />
            <input
                type="text"
                value={editedRestaurant.phoneNumber || ""}
                onChange={(e) => setEditedRestaurant({ ...editedRestaurant, phoneNumber: e.target.value })}
                placeholder="Phone Number"
            />
            <button className="edit-btn" onClick={() => onSave(editedRestaurant)}>Save</button>
            <button className="delete-btn" onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default EditRestaurantForm;
