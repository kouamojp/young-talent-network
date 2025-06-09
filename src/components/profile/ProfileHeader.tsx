
import React from 'react';
import { Link } from 'react-router-dom';

const ProfileHeader: React.FC = () => {
  return (
    <div className="bg-[#5181B8] text-white py-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">Y&T</div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/" className="hover:text-blue-200">Новости</Link>
              <Link to="/messages" className="hover:text-blue-200">Сообщения</Link>
              <Link to="/communities" className="hover:text-blue-200">Сообщества</Link>
              <Link to="/work" className="hover:text-blue-200">Работа</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">Александр Иванов ▼</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
