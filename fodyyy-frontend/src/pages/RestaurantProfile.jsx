import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import restaurantService from '../services/restaurantService';
import ImageInput from '../components/ImageInput';
import toast from 'react-hot-toast';

const RestaurantProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    image: '',
    operatingHours: {
      open: '09:00',
      close: '22:00',
      isOpen: true
    },
    deliverySettings: {
      deliveryTime: 30,
      deliveryCharge: 30,
      freeDeliveryAbove: 300,
      deliveryRadius: 5
    },
    cuisineTypes: [],
    features: {
      takeaway: true,
      delivery: true,
      dineIn: false
    }
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [availableCuisines] = useState([
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Continental',
    'South Indian', 'North Indian', 'Fast Food', 'Desserts', 'Beverages'
  ]);

  useEffect(() => {
    loadRestaurantProfile();
  }, []);

  const loadRestaurantProfile = async () => {
    try {
      setIsLoading(true);
      const response = await restaurantService.getRestaurantProfile();
      
      if (response.success) {
        const data = response.data;
        setFormData({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || user?.email || '',
          image: data.image || '',
          operatingHours: {
            open: data.operatingHours?.open || '09:00',
            close: data.operatingHours?.close || '22:00',
            isOpen: data.operatingHours?.isOpen !== false
          },
          deliverySettings: {
            deliveryTime: data.deliverySettings?.deliveryTime || 30,
            deliveryCharge: data.deliverySettings?.deliveryCharge || 30,
            freeDeliveryAbove: data.deliverySettings?.freeDeliveryAbove || 300,
            deliveryRadius: data.deliverySettings?.deliveryRadius || 5
          },
          cuisineTypes: data.cuisineTypes || [],
          features: {
            takeaway: data.features?.takeaway !== false,
            delivery: data.features?.delivery !== false,
            dineIn: data.features?.dineIn || false
          }
        });
        
        if (data.image) {
          setImagePreview(data.image);
        }
      }
    } catch (error) {
      console.error('Error loading restaurant profile:', error);
      toast.error('Failed to load restaurant profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setImageUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await restaurantService.uploadImage(uploadFormData);
      
      if (response.success) {
        const imageUrl = response.data.imageUrl;
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setImagePreview(imageUrl);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(response.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageChange = (imageUrl) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
    setImagePreview(imageUrl);
  };

  const handleCuisineToggle = (cuisine) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Restaurant name is required');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Restaurant description is required');
      return false;
    }

    if (!formData.address.trim()) {
      toast.error('Restaurant address is required');
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    if (formData.cuisineTypes.length === 0) {
      toast.error('Please select at least one cuisine type');
      return false;
    }

    // Validate image URL if provided
    if (formData.image && formData.image.trim()) {
      const isValidUrl = (string) => {
        try {
          const url = new URL(string);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
          return false;
        }
      };

      const isValidImageUrl = (url) => {
        if (!isValidUrl(url)) return false;
        
        // Check for common image hosting services
        const imageHosts = [
          'cloudinary', 'imgur', 'unsplash', 'pexels', 'pixabay', 
          'flickr', 'photobucket', 'imagekit', 'cloudflare', 'amazonaws'
        ];
        
        // Check if URL is from a known image hosting service
        if (imageHosts.some(host => url.toLowerCase().includes(host))) {
          return true;
        }
        
        // Check for image file extensions
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
        return imageExtensions.test(url);
      };

      if (!isValidImageUrl(formData.image.trim())) {
        toast.error('Please enter a valid image URL');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const response = await restaurantService.updateRestaurantProfile(formData);
      
      if (response.success) {
        toast.success('Restaurant profile updated successfully');
        navigate('/restaurant');
      } else {
        toast.error(response.message || 'Failed to update restaurant profile');
      }
    } catch (error) {
      console.error('Error updating restaurant profile:', error);
      toast.error('Failed to update restaurant profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/restaurant')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
              <p className="text-gray-600 mt-1">Manage your restaurant information and settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter restaurant name"
                    className="input w-full"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your restaurant, specialties, and what makes it unique"
                    className="input w-full h-24 resize-none"
                    rows={4}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="10-digit phone number"
                    className="input w-full"
                    maxLength={10}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="restaurant@example.com"
                    className="input w-full"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Complete restaurant address with landmarks"
                    className="input w-full h-20 resize-none"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Restaurant Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Restaurant Image</h3>
              
              <ImageInput
                value={formData.image}
                onChange={handleImageChange}
                onUpload={handleImageUpload}
                uploading={imageUploading}
                placeholder="Enter restaurant image URL"
                previewSize="w-40 h-40"
                uploadText="Upload Photo"
                urlText="Image URL"
                supportedFormats="PNG, JPG, JPEG, WebP"
                maxSize="5MB"
              />
            </div>

            {/* Cuisine Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cuisine Types *</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableCuisines.map((cuisine) => (
                  <label
                    key={cuisine}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.cuisineTypes.includes(cuisine)
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.cuisineTypes.includes(cuisine)}
                      onChange={() => handleCuisineToggle(cuisine)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{cuisine}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Operating Hours</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={formData.operatingHours.open}
                    onChange={(e) => handleInputChange('operatingHours.open', e.target.value)}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={formData.operatingHours.close}
                    onChange={(e) => handleInputChange('operatingHours.close', e.target.value)}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.operatingHours.isOpen}
                    onChange={(e) => handleInputChange('operatingHours.isOpen', e.target.value === 'true')}
                    className="input w-full"
                  >
                    <option value={true}>Open</option>
                    <option value={false}>Temporarily Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.deliverySettings.deliveryTime}
                    onChange={(e) => handleInputChange('deliverySettings.deliveryTime', parseInt(e.target.value))}
                    placeholder="30"
                    className="input w-full"
                    min="15"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.deliverySettings.deliveryCharge}
                    onChange={(e) => handleInputChange('deliverySettings.deliveryCharge', parseInt(e.target.value))}
                    placeholder="30"
                    className="input w-full"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Delivery Above (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.deliverySettings.freeDeliveryAbove}
                    onChange={(e) => handleInputChange('deliverySettings.freeDeliveryAbove', parseInt(e.target.value))}
                    placeholder="300"
                    className="input w-full"
                    min="100"
                    max="1000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    value={formData.deliverySettings.deliveryRadius}
                    onChange={(e) => handleInputChange('deliverySettings.deliveryRadius', parseInt(e.target.value))}
                    placeholder="5"
                    className="input w-full"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
            </div>

            {/* Service Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.features.delivery}
                    onChange={(e) => handleInputChange('features.delivery', e.target.checked)}
                    className="text-primary-600 focus:ring-primary-600 mr-3"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Delivery</span>
                    <p className="text-sm text-gray-600">Deliver food to customers</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.features.takeaway}
                    onChange={(e) => handleInputChange('features.takeaway', e.target.checked)}
                    className="text-primary-600 focus:ring-primary-600 mr-3"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Takeaway</span>
                    <p className="text-sm text-gray-600">Customers can pick up orders</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.features.dineIn}
                    onChange={(e) => handleInputChange('features.dineIn', e.target.checked)}
                    className="text-primary-600 focus:ring-primary-600 mr-3"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Dine In</span>
                    <p className="text-sm text-gray-600">Accept table reservations</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/restaurant')}
                className="px-6 py-3 border border-orange-500 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;