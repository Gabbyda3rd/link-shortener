import { useForm } from '@inertiajs/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function UserFormModal({ user, onClose }) {
    const isEdit = user !== null;

    // useForm keeps the form values AND the server's validation errors together.
    const { data, setData, post, put, processing, errors } = useForm({
        fname: user?.name ?? '',
        mname: user?.name ?? '',
        lname: user?.name ?? '',
        email: user?.email ?? '',
        up_email: user?.up_email ?? '',
        password: '',
        is_admin: user?.is_admin ?? false,
        is_active: user?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };
        if (isEdit) {
            put(route('admin.users.update', user.id), options);
        } else {
            post(route('admin.users.store'), options);
        }
    };

    const inputClass =
        'w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 focus:border-[#7B1113]';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-stone-800">
                        {isEdit ? 'Edit user' : 'Add user'}
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">First Name</label>
                        <input className={inputClass} value={data.fname}
                               onChange={e => setData('fname', e.target.value)} />
                        {errors.fname && <p className="text-xs text-red-500 mt-1">{errors.fname}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Middle Name</label>
                        <input className={inputClass} value={data.mname}
                               onChange={e => setData('mname', e.target.value)} />
                        {errors.mname && <p className="text-xs text-red-500 mt-1">{errors.mname}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Last Name</label>
                        <input className={inputClass} value={data.lname}
                               onChange={e => setData('lname', e.target.value)} />
                        {errors.lname && <p className="text-xs text-red-500 mt-1">{errors.lname}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                        <input type="email" className={inputClass} value={data.email}
                               onChange={e => setData('email', e.target.value)} />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">UP Email</label>
                        <input type="email" className={inputClass} value={data.up_email}
                               onChange={e => setData('up_email', e.target.value)} />
                        {errors.up_email && <p className="text-xs text-red-500 mt-1">{errors.up_email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                            Password {isEdit && <span className="text-stone-400 font-normal">(leave blank to keep)</span>}
                        </label>
                        <input type="password" autoComplete="new-password" className={inputClass}
                               value={data.password}
                               onChange={e => setData('password', e.target.value)} />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm text-stone-700">
                            <input type="checkbox" className="w-4 h-4 accent-[#7B1113]"
                                   checked={data.is_admin}
                                   onChange={e => setData('is_admin', e.target.checked)} />
                            Admin
                        </label>
                        <label className="flex items-center gap-2 text-sm text-stone-700">
                            <input type="checkbox" className="w-4 h-4 accent-[#7B1113]"
                                   checked={data.is_active}
                                   onChange={e => setData('is_active', e.target.checked)} />
                            Active
                        </label>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                                className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                                className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                                style={{ background: 'linear-gradient(90deg, #7B1113, #9B1517)' }}>
                            {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}