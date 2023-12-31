const ServiceModel = require("../../models/service.model");
const ApisTreeModel = require("../../models/apisTree.model");
const EndpointModel = require("../../models/endpoint.model");
const EnvironmentModel = require("../../models/environment.model");
const ReadmeModel = require("../../models/readme.model");
const SchemaModel = require("../../models/schema.model");
const UserModel = require("../../models/user.model");
const { successResponse, errorResponse } = require("../../utils/response.format");

/**
 * @description Function to delete service by mongoId
 */
module.exports.deleteService = async (req, res, next) => {
  const { mongoId } = req.params;

  if (mongoId === "62920390b3931700682e2fc7") {
    return errorResponse({ res, statusCode: 400, message: `This is an example service and cannot be deleted` });
  }

  const serviceToBeDeleted = await ServiceModel.findOne({ _id: mongoId }).catch(next);

  await Promise.all([
    deleteApisTreeOfService(mongoId),
    deleteEndpointsOfService(mongoId),
    deleteEnvironmentsOfService(mongoId),
    deleteReadmesOfService(mongoId),
    deleteSchemasOfService(mongoId),
    removeServiceAccessFromAllUsers(serviceToBeDeleted && serviceToBeDeleted.serviceName),
  ]);

  ServiceModel.findOneAndDelete({ _id: mongoId })
    .then((deletedService) => {
      if (!deletedService) {
        return errorResponse({ res, statusCode: 400, message: `Service with id ${mongoId} NOT found` });
      }

      successResponse({ res, message: `Service with id ${mongoId} deleted`, data: deletedService });
    })
    .catch(next);
};

const deleteApisTreeOfService = (serviceMID) => {
  return ApisTreeModel.deleteMany({ serviceMID })
    .then((response) => [true, response])
    .catch((error) => [false, error]);
};
const deleteEndpointsOfService = (serviceMID) => {
  return EndpointModel.deleteMany({ serviceMID })
    .then((response) => [true, response])
    .catch((error) => [false, error]);
};

const deleteEnvironmentsOfService = (serviceMID) => {
  return EnvironmentModel.deleteMany({ serviceMID })
    .then((response) => [true, response])
    .catch((error) => [false, error]);
};

const deleteReadmesOfService = (serviceMID) => {
  return ReadmeModel.deleteMany({ serviceMID })
    .then((response) => [true, response])
    .catch((error) => [false, error]);
};

const deleteSchemasOfService = (serviceMID) => {
  return SchemaModel.deleteMany({ serviceMID })
    .then((response) => [true, response])
    .catch((error) => [false, error]);
};

const removeServiceAccessFromAllUsers = (serviceName) => {
  return UserModel.updateMany({}, { $pull: { editAccess: serviceName } });
};
