const AccountsTable = ({ accounts, onEdit, onDelete }) => {
    return (
        <section>
            <h2>Accounts</h2>
            {accounts.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account.id}>
                                <td>{account.id}</td>
                                <td>{account.firstName} {account.lastName}</td>
                                <td>{account.mailAddress}</td>
                                <td>{account.accountType}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => onEdit(account)}>Edit</button>
                                    <button className="delete-btn" onClick={() => onDelete(account.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No accounts found.</p>
            )}
        </section>
    );
};

export default AccountsTable;
