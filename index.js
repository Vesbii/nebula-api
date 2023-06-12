const express = require('express')
const cors = require('cors');
const app = express()
const port = 3006
const db = require('./sqlservice')
const bp = require('body-parser');
app.use(cors());
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

// ================================== Sever Setup ==================================
// Keeps server alive for the duration of runtime
app.listen(port, () => {
    console.log(`Nebula Servers listening for requests on port ${port}`)
})

// ================================== Category Page Endpoints ==================================
// Handles requests for the category page
app.get('/api/getCategories', function(req, res, next) {
    var sql=`SELECT * FROM Categories`;
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
        res.send(data)
    });
});

// Handles requests for the addition of categories
app.get('/api/addCategoryData/:categoryName', function(req, res, next) {
    var categoryName= req.params.categoryName;
    var sql="INSERT INTO Categories (CategoryName) VALUES ('" + categoryName+ "')";
  
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
    });
});

// Handles requests for editing of categories
app.post('/api/editCategoryData', function(req, rest){
    var categoryID = req.body.categoryID;
    var categoryValue = req.body.categoryValue;
  
    var sql = "UPDATE Categories SET CategoryName = '" + String(categoryValue) + "' WHERE CategoryID = '" + String(categoryID) + "'"
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
    });
});
  
// Handles requests to delete Categories
app.post('/api/deleteCategoryData', function(req, rest){
    var categoryID = req.body.categoryID;
  
    var sql = "DELETE FROM Categories WHERE CategoryID='" + String(categoryID) + "'"
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
    });
});

// ================================== Product Page Endpoints ==================================

// Handles requests for the products page
app.get('/api/getProducts', function(req, res, next) {
    var sql=`SELECT Products.ProductID, Products.ProductIndex, Products.ProductName, Categories.CategoryName, Products.CategoryID
    FROM Products 
    INNER JOIN Categories 
    ON Products.CategoryID = Categories.CategoryID`;
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
        res.send(data)
    });
});
  
// Handles requests for the addition of products
app.post('/api/addProductData', function(req, res) {
    var productIndex = req.body.productIndex;
    var categoryID= req.body.categoryID;
    var productName= req.body.productName;
  
    var sql="INSERT INTO Products (ProductIndex, ProductName, CategoryID) VALUES ('" + productIndex + "' ,'" + productName+ "' ,'" + categoryID + "')"
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
    });
});
  
// Handles requests for editing of products
app.post('/api/editProductData', function(req, res) {
    var productID = req.body.productID;
    var productIndex = req.body.productIndex;
    var categoryID= req.body.categoryID;
    var productName= req.body.productName;
    
    var sql="UPDATE Products Set ProductIndex = '" + productIndex + "', ProductName = '" + productName + "', CategoryID = '" + categoryID + "' WHERE ProductID = " + productID
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
    });
});
  
// Handles requests for deletion of products
app.post('/api/deleteProductData', function(req, rest){
    var productID = req.body.productID;
  
    var sql = "DELETE FROM Products WHERE ProductID='" + String(productID) + "'"
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
    });
});
  
// Handles requests for deletion of products
app.post('/api/deleteAllVariantsUnderProduct', function(req, rest){
    var productID = req.body.productID;
  
    var sql = "DELETE FROM Variants WHERE ProductID='" + String(productID) + "'"
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
    });
});

// ================================== Variant Page Endpoints ==================================

// Handles requests for variant pages by product ID
app.get('/api/getVairants/:productID', function(req, res, next) {
  var productID= req.params.productID;

  var sql=`SELECT VariantID, VariantIndex, VariantName, VariantPrice FROM Variants WHERE ProductID = ${productID}`;

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
    res.send(data)
  });
});

// Handles requests for the addition of variants
app.post('/api/addVariant', function(req, res) {
    var variantID = req.body.variantID;
    var variantName= req.body.variantName;
    var variantIndex = req.body.variantIndex;
    var variantPrice = req.body.variantPrice;
    var productID = req.body.productID;

  
  
    var sql=`INSERT INTO Variants ( VariantID, VaraintName, VariantIndex, VariantPrice , ProductID) VALUES ('${variantID}', '${variantName}', '${variantIndex}', '${variantPrice}', '${productID}' )`
    db.query(sql, function (err, data) {
      if (err){
        console.log(err)
      };
    });
});
  
  
app.post('/api/deleteVariant', function(req, res){
    var variantID = req.body.variantID;
  
    var sql = `DELETE FROM Variants WHERE VariantID = ${variantID}`
    db.query(sql, function (err, data) {
      if (err){
        console.log(err)
      };
    })
})

app.post('/api/editVariant', function(req, rest){
    var variantID = req.body.variantID;
    var variantName= req.body.variantName;
    var variantIndex = req.body.variantIndex;
    var variantPrice = req.body.variantPrice;
    var productID = req.body.productID;
  
  
    var sql = `UPDATE Variants Set VariantID = '${variantID}', VariantName = '${variantName}', VariantIndex = '${variantIndex}', VariantPrice = '${variantPrice}', ProductID = '${productID}'`;

    sql += ` WHERE VariantID = ${variantID}`
  
    db.query(sql, function (err, data) {
      if (err){
        console.log(err)
      };
    });
})

app.post('/api/deleteAllVariantDetailsUnderVariant', function(req, rest){
    var variantID = req.body.variantID;
  
    var sql = "DELETE FROM VariantDetails WHERE VariantsID = '" + String(variantID) + "'"
    db.query(sql, function (err, data) {
        if (err){
            console.log(err)
        };
    });
});

// ================================== VariantDetails Page Endpoints ==================================

// Handles requests for variantDetails pages by variants ID
app.get('api/getVariantDetails/:VariantsID', function(req, res, next) {
    var variantsID= req.params.variantsID;

    var sql=`SELECT VariantDetailsID, VariantDetailsName, VariantsDetailValue FROM VariantDetails WHERE VariantsID = ${variantsID}`;

    db.query(sql, function (err, data) {
        if (err){
          console.log(err)
        };
        res.send(data)
    });
});

// Handles requests for the addition of variantDetails
app.post('/api/addVariantDetails', function(req, res) {
    var variantDetailsID = req.body.variantDetailsID;
    var variantDetailsName= req.body.variantDetailsName;
    var variantsDetailValue = req.body.variantsDetailValue;
    var variantsID = req.body.variantsID;
  
    var sql=`INSERT INTO VariantDetails ( VariantDetailsID, VariantDetailsName, VariantsDetailValue, VariantsID) VALUES ('${variantDetailsID}', '${variantDetailsName}', '${variantsDetailValue}', '${variantsID}' )`
    db.query(sql, function (err, data) {
      if (err){
        console.log(err)
      };
    });
});
 
// Handles requests for deleting of variantDetails
app.post('/api/deleteVariantDetails', function(req, res){
    var variantDetailsID = req.body.variantDetailsID;
  
    var sql = `DELETE FROM VariantDetails WHERE VariantDetailsID = ${variantDetailsID}`
    db.query(sql, function (err, data) {
      if (err){
        console.log(err)
      };
    })
})

// Handles requests for editing of variantDetails
app.post('/api/editVariantDetails', function(req, rest){
    var variantDetailsID = req.body.variantDetailsID;
    var variantDetailsName= req.body.variantDetailsName;
    var variantsDetailValue = req.body.variantsDetailValue;
    var variantsID = req.body.variantsID;
  
  
    var sql = `UPDATE Variants Set VariantDetailsName = '${variantDetailsName}', VariantsDetailValue = '${variantsDetailValue}', VariantsID = '${variantsID}'`;

    sql += ` WHERE VariantDetailsID = ${variantDetailsID}`
  
    db.query(sql, function (err, data) {
      if (err){
        console.log(err)
      };
    });
})

