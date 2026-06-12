import { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import {
  Plus,
  Users as UsersIcon,
  X,
  ToggleLeft,
  ToggleRight,
  Upload,
  Download,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import excelFormatImg from "../../assets/excel-format.png";
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
const [showAllErrors, setShowAllErrors] = useState(false);
const [selectedIds, setSelectedIds] = useState([])
const [bulkDeleting, setBulkDeleting] = useState(false)
const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  // Pagination + search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
  city: "",
  state: "",
    role: "dealer",
  });

  useEffect(() => {
    setPage(1);
  }, [search, filterRole, limit]);

  useEffect(() => {
    fetchUsers();
  }, [page, search, filterRole, limit]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      const res = await api.get("/users", { params });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error("Failed to load users" , err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleSubmit = async () => {
    if (!form.code || !form.address || !form.city || !form.state || !form.name || !form.phone || !form.role) {
      return toast.error("Code, name, phone , address, city, state and role are required");
    }
    try {
      await api.post("/users", form);
      toast.success("User created!");
      setShowForm(false);
setForm({
  code: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  role: "dealer",
});
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      setUsers(
        users.map((u) => (u._id === id ? { ...u, isActive: !isActive } : u)),
      );
      toast.success(isActive ? "User deactivated" : "User activated");
    } catch (err) {
      toast.error("Failed to update status" , err);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setDeleting(true);
      await api.delete(`/users/${selectedUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      return toast.error("Please upload an Excel or CSV file");
    }
    setBulkUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/users/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(res.data.results);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk upload failed");
    }
    setBulkUploading(false);
    e.target.value = "";
  };

 const downloadTemplate = () => {
  try {
    // 1. Define headers (fixed order)
    const headers = [
      "Member No.",
      "Dealer Code",
      "VIP Name",
      "Dealership Name",
      "Mobile No.",
      "Email-ID",
"Address",
  "City",
  "State",
    ];

    // 2. Sample row (helps user understand format)
    const sampleRow = [
      "EK-001",
      "DL-001",
      "Dealer Person Name",
      "Dealer Shop Name",
      "9876543210",
      "dealer@email.com",
      "Full Address Here",
      "Dealer City",
      "Dealer State",
    ];

    // 3. Create worksheet (header + sample)
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

    // 4. Set column widths (clean UI)
    ws["!cols"] = [
      { wch: 18 },
      { wch: 25 },
            { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
{ wch: 20 },
      { wch: 28 },
      { wch: 35 },
    ];

    // 5. Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dealers");

    // 6. (PRO) Add Instructions sheet
    const instructions = [
      ["Upload Instructions"],
      [""],
      ["1. Do not change column names"],
      ["2. Member No. must be unique"],
      ["3. Mobile No. must be 10 digits"],
      ["4. Duplicate phone or code will be skipped"],
      ["5. Name or Dealership Name is required"],
      ["6. Empty rows will be ignored"],
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, ws2, "Instructions");

    // 7. File name with date (professional)
    const fileName = `dealer_template_${new Date().toISOString().slice(0,10)}.xlsx`;

    XLSX.writeFile(wb, fileName);

  } catch (error) {
    console.error("Template download failed:", error);
  }
};

const toggleSelectUser = (id) => {
  setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  )
}

const toggleSelectAll = () => {
  if (selectedIds.length === users.length) {
    setSelectedIds([])
  } else {
    setSelectedIds(users.map(u => u._id))
  }
}

const handleBulkDelete = async () => {
  setBulkDeleting(true)
  try {
    const res = await api.delete('/users/bulk-delete', { data: { ids: selectedIds } })
    toast.success(res.data.message)
    setSelectedIds([])
    setShowBulkDeleteModal(false)
    fetchUsers()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Bulk delete failed')
  }
  setBulkDeleting(false)
}

  const roleConfig = {
    admin: { color: "bg-purple-100 text-purple-700" },
    dealer: { color: "bg-blue-100 text-blue-700" },
    employee: { color: "bg-orange-100 text-orange-700" },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
<div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Header */}
<div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
            <div>
            <h2 className="text-xl font-black text-gray-800">Manage Users</h2>
            <p className="text-gray-400 text-sm">{total} users registered</p>
          </div>
<div className="flex flex-wrap items-center gap-2">
              <label
              className={`flex items-center justify-center gap-2 border-2 border-amber-500 w-full sm:w-auto text-amber-600 px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer hover:bg-amber-50 ${bulkUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Upload size={16} />
              {bulkUploading ? "Uploading..." : "Bulk Upload"}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleBulkUpload}
                disabled={bulkUploading}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center justify-center gap-2 border border-gray-200 w-full sm:w-auto text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold transition hover:bg-gray-50"
            >
              <Download size={16} />
              Template
            </button>

{selectedIds.length > 0 && (
  <button
    onClick={() => setShowBulkDeleteModal(true)}
    className="flex items-center justify-center gap-2 bg-red-500 w-full sm:w-auto hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition"
  >
    <Trash2 size={16} />
    Delete {selectedIds.length} Selected
  </button>
)}

            <button
              onClick={() => setShowForm(true)}
             className="flex items-center justify-center gap-2 bg-amber-500 w-full sm:w-auto hover:bg-amber-600 text-black px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-amber-100"
            >
              <Plus size={16} />
              Add User
            </button>
          </div>
        </div>

        {/* Search + Filter + Items per page */}
<div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
            {/* Search */}
<form onSubmit={handleSearch} className="relative flex-1">
              <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, phone, code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
          </form>

          {/* Role filter */}
<div className="flex flex-wrap gap-2">
              {["", "admin", "dealer", "employee"].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition ${
                  filterRole === role
                    ? "bg-amber-500 text-black"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-amber-400"
                }`}
              >
                {role === ""
                  ? "All"
                  : role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          {/* Items per page */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </div>

        {/* Results info */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-800">{users.length}</span> of{" "}
            <span className="font-bold text-gray-800">{total}</span> users
          </p>
          {(search || filterRole) && (
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setFilterRole("");
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Add User Modal */}
        {showForm && (
<div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-black text-gray-800">Add New User</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-3">
                <input
                  placeholder="Dealer Code * (e.g. EK-004)"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  placeholder="Phone Number *"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

<input
  placeholder="Address"
  value={form.address}
  onChange={(e) =>
    setForm({
      ...form,
      address: e.target.value,
    })
  }
  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
/>

<input
  placeholder="City"
  value={form.city}
  onChange={(e) =>
    setForm({
      ...form,
      city: e.target.value,
    })
  }
  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
/>

<input
  placeholder="State"
  value={form.state}
  onChange={(e) =>
    setForm({
      ...form,
      state: e.target.value,
    })
  }
  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
/>

                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="dealer">Dealer</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
<div className="flex flex-col sm:flex-row gap-2 px-6 pb-6">
                  <button
                  onClick={handleSubmit}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-xl text-sm font-bold transition"
                >
                  Create User
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-black text-gray-800">Delete User</h3>
              </div>
              <div className="p-6 text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-800">
                  {selectedUser?.name}
                </span>
                ? This cannot be undone.
              </div>
              <div className="flex gap-2 px-6 pb-6">
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold transition"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <UsersIcon size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">No users found</p>
          </div>
        ) : (
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
<table className="w-full text-sm min-w-[850px]">
               <thead className="bg-gray-50">
  <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
    <th className="px-5 py-3">
      <input
        type="checkbox"
        checked={selectedIds.length === users.length && users.length > 0}
        onChange={toggleSelectAll}
        className="w-4 h-4 accent-amber-500 cursor-pointer"
      />
    </th>
    <th className="px-5 py-3">User</th>
    <th className="px-5 py-3">Phone</th>
    <th className="px-5 py-3">Role</th>
    <th className="px-5 py-3">Status</th>
    <th className="px-5 py-3">Action</th>
  </tr>
</thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className={`border-t border-gray-50 hover:bg-gray-50 transition ${selectedIds.includes(user._id) ? 'bg-amber-50' : ''}`}>
  <td className="px-5 py-3">
    <input
      type="checkbox"
      checked={selectedIds.includes(user._id)}
      onChange={() => toggleSelectUser(user._id)}
      className="w-4 h-4 accent-amber-500 cursor-pointer"
    />
  </td>
  {/* rest of columns */}
                    <td className="px-5 py-3">
<div className="flex items-center gap-3 min-w-[220px]">
                          <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-black font-black text-sm">
                            {user.name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      +91 {user.phone}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${roleConfig[user.role]?.color}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
<div className="flex items-center gap-2 flex-wrap">
                          <button
                          onClick={() => handleToggle(user._id, user.isActive)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                            user.isActive
                              ? "bg-red-50 text-red-500 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <ToggleRight size={14} /> Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={14} /> Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-500">
              Page <span className="font-bold">{page}</span> of{" "}
              <span className="font-bold">{totalPages}</span>
            </p>
<div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} /> Prev
              </button>
<div className="flex items-center gap-1 flex-wrap justify-center">
                  {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                          page === pageNum
                            ? "bg-amber-500 text-black"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <span key={pageNum} className="text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Upload Result Popup */}
      {uploadResult && (
<div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 z-50">
<div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full sm:w-72">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <p className="font-black text-gray-800 text-sm">
                  Bulk Upload Complete
                </p>
                <p className="text-xs text-gray-400">
                  Total processed: {uploadResult.created + uploadResult.skipped}
                </p>
              </div>
              <button
                onClick={() => setUploadResult(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400"
              >
                <X size={14} />
              </button>
            </div>
            <div className="px-4 py-3 flex gap-2">
              <div className="flex-1 bg-green-50 rounded-xl p-2.5 text-center">
                <p className="text-xl font-black text-green-700">
                  {uploadResult.created}
                </p>
                <p className="text-xs text-green-600 font-medium">Added</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-xl p-2.5 text-center">
                <p className="text-xl font-black text-red-500">
                  {uploadResult.skipped}
                </p>
                <p className="text-xs text-red-400 font-medium">Skipped</p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center">
                <p className="text-xl font-black text-gray-600">
                  {uploadResult.errors?.length || 0}
                </p>
                <p className="text-xs text-gray-400 font-medium">Errors</p>
              </div>
            </div>
            {uploadResult.errors?.length > 0 && (
              <div className="px-4 pb-3">
                <div className="bg-gray-50 rounded-xl p-2.5 max-h-28 overflow-y-auto">
  {(showAllErrors ? uploadResult.errors : uploadResult.errors.slice(0, 5)).map((err, i) => (
    <p
      key={i}
      className="text-xs text-gray-500 py-0.5 border-b border-gray-100 last:border-0"
    >
      {err.replace("Row skipped — ", "").replace("Skipped — ", "")}
    </p>
  ))}
</div>

{uploadResult.errors.length > 5 && (
  <button
    onClick={() => setShowAllErrors(!showAllErrors)}
    className="text-xs text-amber-600 font-bold mt-2"
  >
    {showAllErrors ? "Show Less" : `View All (${uploadResult.errors.length})`}
  </button>
)}
              </div>
            )}
            {uploadResult.created === 0 && (
              <div className="px-4 pb-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  <p className="text-xs text-amber-700 font-bold">
                    No users added!
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Check column names or download template.
                  </p>
                </div>
              </div>
            )}
            <div className="px-4 pb-4">
              <button
                onClick={() => setUploadResult(null)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black py-2 rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}


     {showTemplateModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <h3 className="font-black text-gray-800">Excel Format Guide</h3>
        <button
          onClick={() => setShowTemplateModal(false)}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="p-6 space-y-5 overflow-y-auto">

        <p className="text-sm text-gray-500">
          Follow this format while uploading your Excel file.
        </p>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <img
            src={excelFormatImg}
            alt="Excel format preview"
            className="w-full"
          />
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs text-gray-600">
          <p className="font-bold text-gray-700 text-sm">Upload Rules</p>
          <p>• Member No. is required (unique code)</p>
          <p>• Mobile No. must be 10 digits</p>
          <p>• Name or Dealership Name is required</p>
          <p>• Email is optional but must be valid</p>
          <p>• City is required</p>
<p>• State is required</p>

          <div className="border-t my-2"></div>

          <p className="font-bold text-gray-700 text-sm">Duplicate Handling</p>
          <p>• Duplicate phone or code will be skipped</p>
          <p>• Existing users will not be overwritten</p>

          <div className="border-t my-2"></div>

          <p className="font-bold text-gray-700 text-sm">Common Mistakes</p>
          <p>• Column names must match exactly</p>
          <p>• Extra spaces in phone/code can cause errors</p>
          <p>• Empty rows will be ignored</p>
        </div>

        <p className="text-xs text-amber-600 font-medium">
          Tip: Download template and fill it directly to avoid errors.
        </p>

      </div>

      {/* Footer */}
<div className="flex flex-col sm:flex-row gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
          onClick={downloadTemplate}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-xl text-sm font-bold"
        >
          Download Template
        </button>

        <button
          onClick={() => setShowTemplateModal(false)}
          className="px-4 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}

{showBulkDeleteModal && (
<div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-black text-gray-800">Bulk Delete Users</h3>
      </div>
      <div className="p-6 text-sm text-gray-600">
        Are you sure you want to delete <span className="font-black text-red-600">{selectedIds.length} users</span>? This cannot be undone.
      </div>
<div className="flex flex-col sm:flex-row gap-2 px-6 pb-6">
          <button
          onClick={handleBulkDelete}
          disabled={bulkDeleting}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold transition"
        >
          {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Users`}
        </button>
        <button
          onClick={() => setShowBulkDeleteModal(false)}
          className="px-4 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Users;
