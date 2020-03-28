const ErrorResponse = require('../Utils/errorResponce');
const asyncHandler = require('../middleware/async');
const Course = require('../model/Course');
const Bootcamp = require('../model/Bootcamp');

// @desc    Get course
// @route   Get/api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampID/courses
// @ access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});
// exports.getCourses = async (req, res, next) => {
//   try {
//     const courses = await Course.find();
//     res.status(200).json({
//       success: true,
//       count: courses.length,
//       data: courses
//     });
//   } catch (err) {
//     res.status(400).json({ success: false });
//   }
// };

// @desc    Get single course
// @route   Get/api/v1/courses/:id
// @ access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course) {
    return next(
      new ErrorResponse(`NO course with the id of ${req.params.id}, 404`)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Add course
// @route   post/api/v1/bootcamps/:bootcampId/course
// @ access Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `NO bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    update course
// @route   put/api/v1/course/:id
// @ access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `NO bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   Delete/api/v1/course/:id
// @ access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `NO bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }
  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
