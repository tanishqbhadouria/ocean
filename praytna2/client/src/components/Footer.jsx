import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} Voyage Ocean Routing. All rights reserved.
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Powered by</span>
            <span className="text-sm font-semibold text-blue-600">PRAYATNA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
