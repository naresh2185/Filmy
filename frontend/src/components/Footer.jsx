import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Movies By Genre</h4>
            <ul className="space-y-1 text-xs">
              <li className="hover:text-white cursor-pointer">Action</li>
              <li className="hover:text-white cursor-pointer">Comedy</li>
              <li className="hover:text-white cursor-pointer">Drama</li>
              <li className="hover:text-white cursor-pointer">Horror</li>
              <li className="hover:text-white cursor-pointer">Romance</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Movies By Language</h4>
            <ul className="space-y-1 text-xs">
              <li className="hover:text-white cursor-pointer">Hindi</li>
              <li className="hover:text-white cursor-pointer">English</li>
              <li className="hover:text-white cursor-pointer">Tamil</li>
              <li className="hover:text-white cursor-pointer">Telugu</li>
              <li className="hover:text-white cursor-pointer">Malayalam</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Help</h4>
            <ul className="space-y-1 text-xs">
              <li className="hover:text-white cursor-pointer">About Us</li>
              <li className="hover:text-white cursor-pointer">Contact Us</li>
              <li className="hover:text-white cursor-pointer">Current Openings</li>
              <li className="hover:text-white cursor-pointer">Press Release</li>
              <li className="hover:text-white cursor-pointer">FAQs</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Connect</h4>
            <div className="flex gap-3 mb-4">
              <Facebook className="w-5 h-5 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-white cursor-pointer" />
              <Youtube className="w-5 h-5 hover:text-white cursor-pointer" />
            </div>
            <p className="text-xs">Get the Filmy app on your phone for a faster, hassle-free booking experience.</p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-xs text-center">
          <p>Copyright 2025 © Filmy Entertainment Pvt. Ltd. All Rights Reserved.</p>
          <p className="mt-2 text-gray-500">The content and images used on this site are copyright protected. This is a clone made for demo purposes.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
