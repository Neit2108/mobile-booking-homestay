import { useState, useEffect } from 'react';

/**
 * Custom hook to handle both filtering and sorting of homestay data
 * 
 * @param {Array} places - Original array of place data
 * @returns {Object} Filtering state and methods
 */
export const useHomestayFiltering = (places = []) => {
  // Filter criteria state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [ratingFilter, setRatingFilter] = useState('');
  const [guestsFilter, setGuestsFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  
  // Filtered and sorted results
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  
  // Current page for pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Apply all filters and sorting whenever criteria or source data changes
  useEffect(() => {
    if (!places || places.length === 0) {
      setFilteredPlaces([]);
      return;
    }
    
    let results = [...places];
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        place => 
          (place.name?.toLowerCase() || '').includes(searchLower) || 
          (place.address?.toLowerCase() || '').includes(searchLower) ||
          (place.description?.toLowerCase() || '').includes(searchLower)
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      results = results.filter(place => 
        (place.category?.toLowerCase() || '') === categoryFilter.toLowerCase()
      );
    }
    
    // Apply price range filter
    if (priceRange.min) {
      const minPrice = parseFloat(priceRange.min);
      if (!isNaN(minPrice)) {
        results = results.filter(place => (place.price || 0) >= minPrice);
      }
    }
    
    if (priceRange.max) {
      const maxPrice = parseFloat(priceRange.max);
      if (!isNaN(maxPrice)) {
        results = results.filter(place => (place.price || 0) <= maxPrice);
      }
    }
    
    // Apply rating filter
    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter);
      if (!isNaN(minRating)) {
        results = results.filter(place => (place.rating || 0) >= minRating);
      }
    }
    
    // Apply guests filter
    if (guestsFilter) {
      const minGuests = parseInt(guestsFilter);
      if (!isNaN(minGuests)) {
        results = results.filter(place => (place.maxGuests || 0) >= minGuests);
      }
    }
    
    // Apply sorting
    if (sortOption) {
      switch (sortOption) {
        case 'most-rated':
          results.sort((a, b) => (b.numOfRating || 0) - (a.numOfRating || 0));
          break;
        case 'least-rated':
          results.sort((a, b) => (a.numOfRating || 0) - (b.numOfRating || 0));
          break;
        case 'highest-rating':
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'lowest-rating':
          results.sort((a, b) => (a.rating || 0) - (b.rating || 0));
          break;
        case 'price-low-high':
          results.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-high-low':
          results.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        default:
          break;
      }
    }
    
    setFilteredPlaces(results);
    setCurrentPage(1); // Reset page when filters change
  }, [
    places, 
    searchTerm, 
    categoryFilter, 
    priceRange, 
    ratingFilter, 
    guestsFilter,
    sortOption
  ]);

  // Handle price range changes with validation
  const handlePriceChange = (field, value) => {
    // Validate number
    if (value !== '' && isNaN(parseFloat(value))) {
      return; // Don't update if not a valid number
    }
    
    setPriceRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setPriceRange({ min: '', max: '' });
    setRatingFilter('');
    setGuestsFilter('');
    setSortOption('');
    setCurrentPage(1);
  };

  // Getter for paginated results
  const getPaginatedResults = (itemsPerPage) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    return {
      items: filteredPlaces.slice(indexOfFirstItem, indexOfLastItem),
      totalItems: filteredPlaces.length,
      totalPages: Math.ceil(filteredPlaces.length / itemsPerPage)
    };
  };

  return {
    // Filter states
    searchTerm,
    categoryFilter,
    priceRange,
    ratingFilter,
    guestsFilter,
    sortOption,
    
    // Setters
    setSearchTerm,
    setCategoryFilter,
    handlePriceChange,
    setRatingFilter,
    setGuestsFilter,
    setSortOption,
    
    // Pagination
    currentPage,
    setCurrentPage,
    getPaginatedResults,
    
    // Results and helpers
    filteredPlaces,
    resetFilters
  };
};