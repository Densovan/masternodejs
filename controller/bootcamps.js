const ErrorResponse = require('../Utils/errorResponce');
const asyncHandler = require('../middleware/async');
const geocoder = require('../Utils/geocoder');
const Bootcamp = require('../model/Bootcamp');
//@desc     Get all bootcamps
//@route    Get /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  //Loop over removeField and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  console.log(reqQuery);
  //Create query string
  let queryStr = JSON.stringify(reqQuery);

  //Create operator ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  //Finding resource
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  query = query.skip(startIndex).limit(limit);
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  //Executing query
  const boocamps = await query;

  //Pagination result
  const pagenation = {};

  if (endIndex < total) {
    pagenation.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagenation.prev = {
      page: page - 1,
      limit
    };
  }
  res.status(200).json({
    success: true,
    count: boocamps.length,
    pagenation,
    data: boocamps
  });
});

//@desc     Get single bootcamps
//@route    Get /api/v1/bootcamps
//@access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc     Create new boocamps
//@route    post /api/v1/bootcamps
//@access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

//@desc     Update bootcamps
//@route    Put /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
  // next(err);
  // res
  //   .status(200)
  //   .json({ success: true, msg: `update bootcamp ${req.params.id}` });
});

//@desc     Delete  bootcamps
//@route    Delete /api/v1/bootcamps
//@access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return res.status(400).json({ success: false, data: {} });
  }
  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

//@desc     GEt boocamps within a radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide distance by raduis of Earth
  // Earth Radius = 3,863 mi / 6,378 km

  const raduis = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], raduis] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});
