import { useState } from "react";

const EditAccountForm = ({ account, onSave, onCancel }) => {
    const [editedAccount, setEditedAccount] = useState(account);

    return (
        <div className="edit-form">
            <h3>Edit Account</h3>
            <input
                type="text"
                value={editedAccount.firstName || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, firstName: e.target.value })}
                placeholder="First Name"
            />
            <input
                type="text"
                value={editedAccount.lastName || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, lastName: e.target.value })}
                placeholder="Last Name"
            />
            <input
                type="email"
                value={editedAccount.mailAddress || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, mailAddress: e.target.value })}
                placeholder="Email"
            />
            <button className="edit-btn" onClick={() => onSave(editedAccount)}>Save</button>
            <button className="delete-btn" onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default EditAccountForm;
