const chalk = require('chalk');
const mongoose = require('mongoose');
const fs = require('fs'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const { query } = require('express-validator');


function adminsController(Admin) {

  async function getAdmins(req, res, next){
    try{
      const filter = {};
      if(req.query.category){
        filter.category = req.query.category;
      };
      filter.role = 'admin';
      filter.deleted_at = null;
      // console.log(filter);
      
        const admins = await Admin.find(filter);
        
        // console.log(postz);;
        const response =  admins && admins.map(finalAdmin => {
          let showAdmin = {
            admin: finalAdmin, 
            request: {
              type: 'GET',
              url: `http://${req.headers.host}/api/admins/${finalAdmin._id}`,
              viewByStatus: `http://${req.headers.host}/api/admins?role=${finalAdmin.role}`,
              viewByCategory: `http://${req.headers.host}/api/admins?category=${finalAdmin.category}`
            }
          };
          return showAdmin;
        });
        
        res.status(200).json({
          count: admins.length,
          admins:  response
        });

    }
    catch(err){
      console.log(err);
      res.status(500).json({error: err});
    }
  };


  async   function getAdminById(req, res, next){
    const id = req.params.adminId;
    try{
      const check = {_id:id, deleted_at:null, role: 'admin'};
     
      const admin = await Admin.find(check);
    //  console.log(admin);
        if(admin.length > 0){
          res.status(200).json({
            admin : {
            "category": admin[0].category,
            "_id": admin[0]._id,
            "firstName": admin[0].firstName,
            "lastName": admin[0].lastName,
            "email": admin[0].email,
            "role": admin[0].role,
            "display_picture": admin[0].display_picture,
            "createdAt": admin[0].createdAt,
            "updatedAt": admin[0].updatedAt,
            },
            // writtenPosts: {
            //   // count: posts.length,
            //   admin
            // },
            request: {
              type: 'GET',
              description: 'Get all the users', 
              url: 'http://localhost:4000/api/admins/'
            }
          });
        }
        else{
          res.status(404).json({
            error: "admin not found"
          });

        }
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  };


  async function updateAdmin(req, res, next){
    
    const id = req.params.adminId;
    const update = req.body;
    const updateToArray = Object.keys(update)
   
    try{
     const admin = await Admin.find({role: 'admin', _id:id});
      // console.log(admin);
      if(admin.length < 1){
        return res.status(404).json({
          error: "admin not found"
        });
      }

      updateToArray.forEach(key => {
        admin[0][key] = update[key];
      });

      if(req.file){
        // delete the image from storage
        if(admin[0].display_picture){
          fs.unlink( admin[0].display_picture, err => { 
            if(err){
              console.log(err);
            }
          });
        }
        // upload the image from  the database
        admin[0].display_picture = req.file.path;
      }
      
      if(update.password){
        const hashedPassword = await bcrypt.hash(req.body.password, 13);
        admin[0].password = hashedPassword;
      }

      await admin[0].save();
      
      res.status(201).json({
        message: "admin updated successfully",
        admin : {
          "category": admin[0].category,
          "_id": admin[0]._id,
          "firstName": admin[0].firstName,
          "lastName": admin[0].lastName,
          "email": admin[0].email,
          "role": admin[0].role,
          "display_picture": admin[0].display_picture,
          "createdAt": admin[0].createdAt,
          "updatedAt": admin[0].updatedAt,
          }
      });  
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  };


  async function deleteAdmin(req, res, next){
    const id = req.params.adminId;
    try{
      const admin = await Admin.find({role: 'admin', _id:id});
      // console.log(admin);
      if(admin.length < 1){
          return res.status(404).json({
            error: "admin does not exist"
          });
        }
        await admin[0].remove();
        res.status(200).json({
          message: "admin deleted successfully",
          request: {
            type: 'POST',
            description: 'Create new admin', 
            url: 'http://localhost:4000/api/admins/',
            body: {
              firstName: 'String, required',
              lastName: 'String, required',
              email: 'String, required, unique',
              password: 'String, required',
              role: 'String',
              category: 'String',
            }
          }
        });
    }
    catch(err) {
      console.log(err);
      res.status(500).json({
        error: err.message
      });
    };
  }




  return {
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
  };
}

module.exports = adminsController;
