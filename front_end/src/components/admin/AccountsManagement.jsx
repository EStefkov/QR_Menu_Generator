import React from 'react';
import { HiRefresh } from 'react-icons/hi';
import { AccountsTable } from '../../components/AccountsTable';

const AccountsManagement = ({
  t,
  accounts,
  loadingAccounts,
  accountsError,
  loadAccounts,
  onDeleteAccount,
  onEditAccount
}) => {
  if (loadingAccounts) return <div className="mt-8">Loading accounts...</div>;
  if (accountsError) {
    return (
      <div className="bg-red-50 p-5 rounded-lg flex flex-col items-start mt-8">
        <p className="mb-2">{accountsError}</p>
        {loadAccounts && (
          <button onClick={loadAccounts} className="flex items-center mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-lg transition">
            <HiRefresh className="w-5 h-5 mr-2" />
            {t('common.retry') || 'Retry'}
          </button>
        )}
      </div>
    );
  }
  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-blue-50 p-5 rounded-lg mt-8">
        <p>No accounts available or insufficient permission.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">{t('admin.accountsManagement') || 'Accounts Management'}</h3>
      <AccountsTable
        accounts={accounts}
        onEdit={onEditAccount}
        onDelete={onDeleteAccount}
        showTitle={false}
        showSearch={true}
      />
    </div>
  );
};

export default AccountsManagement;
