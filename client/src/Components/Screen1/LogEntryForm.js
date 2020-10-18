import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createLogEntry } from '../../Api/api';

const LogEntryForm = ({ location, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm();
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      data.latitude = location.latitude;
      data.longitude = location.longitude;
      const created = await createLogEntry(data);
      console.log(created);
      onClose();
    } catch (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="entry-form flex flex-column">
      {error ? <h3>{error}</h3> : null}
      <div className="flex">
        <label htmlFor="title" className="flex-1"> Title </label>
        <input name="title" required ref={register} className="border-black flex-2"/>
      </div>
      <div className="flex">
        <label htmlFor="comments" className="flex-1"> Comments </label>
        <textarea name="comments" rows={3} ref={register} className="border-black flex-2" />
      </div>
      <div className="flex">
        <label htmlFor="description" className="flex-1"> Description </label>
        <textarea name="description" rows={3} ref={register} className="border-black flex-2" />
      </div>
      <div className="flex">
        <label htmlFor="image" className="flex-1"> Image </label>
        <input name="image" ref={register} className="border-black flex-2" />
      </div>
      <div className="flex">
        <label htmlFor="visitDate" className="flex-1"> Visit Date </label>
        <input name="visitDate" type="date" required ref={register} className="border-black flex-2" />
      </div>
      <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded width-btn">
        {loading ? 'Loading . . .' : 'Created Entry!'}
      </button>
    </form>
  );
};

export default LogEntryForm;
