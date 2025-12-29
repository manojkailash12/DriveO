import express from 'express';
import MasterData from '../models/masterDataModel.js';

const router = express.Router();

// Populate comprehensive Indian data
router.post('/populate-comprehensive-data', async (req, res) => {
  try {
    console.log('🇮🇳 Populating Comprehensive Indian Travel Data...');
    
    // This endpoint will trigger the population script
    // For now, return success message
    res.status(200).json({
      success: true,
      message: 'Use the populate-comprehensive-indian-data.js script to populate data',
      instruction: 'Run: node populate-comprehensive-indian-data.js'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in comprehensive data population',
      error: error.message
    });
  }
});

// Get all states with optimized query
router.get('/states', async (req, res) => {
  try {
    // Use lean() for better performance and add caching headers
    const states = await MasterData.distinct('state', { 
      state: { $exists: true, $ne: null, $ne: '' } 
    }).lean();
    
    // Set cache headers for 5 minutes
    res.set({
      'Cache-Control': 'public, max-age=300',
      'ETag': `states-${states.length}`
    });
    
    res.status(200).json({
      success: true,
      states: states.sort(),
      count: states.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching states',
      error: error.message
    });
  }
});

// Get districts by state with optimized query
router.get('/districts/:state', async (req, res) => {
  try {
    const { state } = req.params;
    
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State parameter is required'
      });
    }

    // Optimized query with lean() and field selection
    const districts = await MasterData.distinct('district', { 
      state: state,
      district: { $exists: true, $ne: null, $ne: '' }
    }).lean();
    
    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=300',
      'ETag': `districts-${state}-${districts.length}`
    });
    
    res.status(200).json({
      success: true,
      districts: districts.sort(),
      count: districts.length,
      state: state
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching districts',
      error: error.message
    });
  }
});

// Get cities by state and district
router.get('/cities/:state/:district', async (req, res) => {
  try {
    const { state, district } = req.params;
    const cities = await MasterData.distinct('city', { 
      state: state,
      district: district,
      city: { $exists: true, $ne: null }
    });
    
    res.status(200).json({
      success: true,
      cities: cities.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cities',
      error: error.message
    });
  }
});

// Get mandals by state and district (for Telangana/Andhra Pradesh)
router.get('/mandals/:state/:district', async (req, res) => {
  try {
    const { state, district } = req.params;
    const mandals = await MasterData.distinct('mandal', { 
      state: state,
      district: district,
      mandal: { $exists: true, $ne: null }
    });
    
    res.status(200).json({
      success: true,
      mandals: mandals.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mandals',
      error: error.message
    });
  }
});

// Get talukas by state and district (for Karnataka)
router.get('/talukas/:state/:district', async (req, res) => {
  try {
    const { state, district } = req.params;
    const talukas = await MasterData.distinct('taluka', { 
      state: state,
      district: district,
      taluka: { $exists: true, $ne: null }
    });
    
    res.status(200).json({
      success: true,
      talukas: talukas.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching talukas',
      error: error.message
    });
  }
});

// Get locations by state, district, and city
router.get('/locations/:state/:district/:city', async (req, res) => {
  try {
    const { state, district, city } = req.params;
    const locations = await MasterData.find({ 
      state: state,
      district: district,
      city: city,
      location: { $exists: true, $ne: null },
      type: 'location'
    }).select('location');
    
    res.status(200).json({
      success: true,
      locations: locations.map(l => l.location).sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
});

// Get tourist places by state
router.get('/tourist-places/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const touristPlaces = await MasterData.find({ 
      state: state,
      type: { $in: ['tourist_place', 'temple'] }
    }).select('location district category description famous_for rating is_popular');
    
    res.status(200).json({
      success: true,
      tourist_places: touristPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tourist places',
      error: error.message
    });
  }
});

// Get popular tourist destinations across India
router.get('/popular-destinations', async (req, res) => {
  try {
    const popularDestinations = await MasterData.find({ 
      type: { $in: ['tourist_place', 'temple'] },
      is_popular: true
    }).select('state district location category description famous_for rating')
      .sort({ rating: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      popular_destinations: popularDestinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular destinations',
      error: error.message
    });
  }
});

// Get temples by state
router.get('/temples/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const temples = await MasterData.find({ 
      state: state,
      type: 'temple'
    }).select('location district description famous_for rating is_popular');
    
    res.status(200).json({
      success: true,
      temples: temples.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching temples',
      error: error.message
    });
  }
});

// Get all famous temples across India
router.get('/famous-temples', async (req, res) => {
  try {
    const famousTemples = await MasterData.find({ 
      type: 'temple'
    }).select('state district location description famous_for rating is_popular')
      .sort({ rating: -1 });
    
    res.status(200).json({
      success: true,
      famous_temples: famousTemples
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching famous temples',
      error: error.message
    });
  }
});

// Search locations and tourist places
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchResults = await MasterData.find({
      $or: [
        { state: { $regex: query, $options: 'i' } },
        { district: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { famous_for: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).select('state district city location type category description famous_for rating is_popular')
      .limit(20);
    
    res.status(200).json({
      success: true,
      search_results: searchResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in search',
      error: error.message
    });
  }
});

// Legacy endpoints for backward compatibility
// Get districts (old format)
router.get('/districts', async (req, res) => {
  try {
    const districts = await MasterData.distinct('district', { 
      type: 'location',
      district: { $exists: true, $ne: null }
    });
    res.status(200).json({
      success: true,
      districts: districts.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching districts',
      error: error.message
    });
  }
});

// Get locations by district (old format)
router.get('/locations/:district', async (req, res) => {
  try {
    const { district } = req.params;
    const locations = await MasterData.find({ 
      district: district, 
      type: 'location' 
    }).select('location');
    
    res.status(200).json({
      success: true,
      locations: locations.map(l => l.location).sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
});

// Car-related endpoints (unchanged)
router.get('/brands', async (req, res) => {
  try {
    const brands = await MasterData.distinct('brand', { type: 'car' });
    res.status(200).json({
      success: true,
      brands: brands.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
});

router.get('/models/:brand', async (req, res) => {
  try {
    const { brand } = req.params;
    const models = await MasterData.distinct('model', { 
      brand: brand, 
      type: 'car' 
    });
    
    res.status(200).json({
      success: true,
      models: models.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching models',
      error: error.message
    });
  }
});

router.get('/variants/:brand/:model', async (req, res) => {
  try {
    const { brand, model } = req.params;
    const variants = await MasterData.find({ 
      brand: brand,
      model: model,
      type: 'car' 
    }).select('variant');
    
    res.status(200).json({
      success: true,
      variants: variants.map(v => v.variant).sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching variants',
      error: error.message
    });
  }
});

export default router;