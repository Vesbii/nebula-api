// Setting up required connections to external modules/frameworks
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

// ================================== Insights Page Enpoints ==================================

app.get('/api/getProductCount', function(req, res, next){
  var sql = `SELECT COUNT(DISTINCT ProductID) FROM Products;`

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});

app.get('/api/getCategoryCount', function(req, res, next){
  var sql = `SELECT COUNT(DISTINCT CategoryID) FROM Categories;`

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});

app.get('/api/getMonthlyOrderCount', function(req, res, next){
  const d = new Date();
  var currentMonth = d.getMonth() + 1;
  var currentYear = d.getFullYear();
  var sql = `SELECT COUNT(DISTINCT OrderID) FROM Orders WHERE MONTH(DueDate) = ${currentMonth} AND YEAR(DueDate) = ${currentYear};`

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});

app.get('/api/getMonthsSales/:monthYear', function(req, res, next){
  var monthYear = req.params.monthYear;
  var x = monthYear.split("x")

  var sql = `
    SELECT Orders.OrderID, OrderDetails.OrderQuantity, Variants.VariantPrice FROM Orders 
    INNER JOIN OrderDetails ON Orders.OrderID = OrderDetails.OrderID
    INNER JOIN Variants ON OrderDetails.VariantID = Variants.VariantID
    WHERE MONTH(CreatedOn) = ${x[0]} AND YEAR(CreatedOn) = ${x[1]} AND (Orders.Status = "C" OR Orders.Status = "A")
    `
    db.query(sql, function (err, data) {
      if (err){
        console.log(err)
      };
     
    //   res.render('users-form', { title: 'User List', editData: data[0]});
        // console.log(data)
        res.send(data)
    });
  

})

// ================================== Inventory Page Enpoints ==================================

// Handles requests for location pages
app.get('/inventory/:location', function(req, res, next) {
    var lcDict = {"taipei": 1, "taichung": 2, "tainan": 3}
    var location= lcDict[req.params.location];
    // console.log(location)
    var sql=`SELECT Inventories.InventoryID, Inventories.ProductID, Products.ProductIndex, Products.ProductName, Inventories.Quantity 
    FROM Inventories
      INNER JOIN Locations
      ON Inventories.locationID = Locations.locationID
      INNER JOIN Products
      ON Inventories.ProductID = Products.ProductID
    WHERE Inventories.locationID = "` + String(location) + '"';
    db.query(sql, function (err, data) {
      if (err){
        console.log(err)
      };
     
    //   res.render('users-form', { title: 'User List', editData: data[0]});
        // console.log(data)
        res.send(data)
    });
});

// Handles requests for location pages
app.get('/inventoryByID/:location', function(req, res, next) {
  var location= req.params.location;
  // console.log(location)
  var sql=`SELECT Inventories.InventoryID, Inventories.ProductID, Products.ProductIndex, Products.ProductName, Inventories.Quantity 
  FROM Inventories
    INNER JOIN Locations
    ON Inventories.locationID = Locations.locationID
    INNER JOIN Products
    ON Inventories.ProductID = Products.ProductID
  WHERE Inventories.locationID = "` + String(location) + '"';
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});

// Handles requests for the addition of products to the inventory 
app.post('/api/addInventoryData', function(req, res) {
  var locationID = req.body.locationID;
  var productID= req.body.productID;
  var productQuantity= req.body.productQuantity;
  
  var sql="INSERT INTO Inventories (ProductID, LocationID, Quantity) VALUES ('" + productID + "', '" + locationID + "' ,'" + productQuantity + "')";
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});

// Handles requests for editing of products in the inventory 
app.post('/api/editInventoryQuantity', function(req,res){
  var inventoryID = req.body.inventoryID;
  var productQuantity = req.body.productQuantity;


  // console.log(inventoryID, productQuantity)
  var sql = "UPDATE Inventories Set Quantity = " + productQuantity + " WHERE InventoryID = " + inventoryID
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});

app.post('/api/deleteInventoryData', function(req, res){
  var inventoryID = req.body.inventoryID;

  var sql = "DELETE FROM Inventories WHERE InventoryID = '" + String(inventoryID) + "'"
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });

})

// ================================== Category Page Endpoints ==================================

// Handles requests for the category page
app.get('/api/getCategories', function(req, res, next) {
  var sql=`SELECT * FROM Categories`;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
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
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
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

// ================================== Orders Page Endpoints ==================================

app.get('/api/getOrders', function(req, res) {
  var sql=`SELECT * FROM Orders`;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
      res.send(data)
  });
});

app.get('/api/getOrdersWithCustomerName', function(req, res) {
  var sql=`SELECT o.*, c.CustomerName
          FROM Orders o
          JOIN Customers c ON o.CustomerID = c.CustomerID
  `;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
      res.send(data)
  });
});


app.post('/api/createOrder', function(req, res){
  var orderName = req.body.orderName;
  var locationID = req.body.locationID;
  var createdBy = req.body.createdBy;
  var approveBy = req.body.approveBy;
  var status = req.body.status;
  var createdOn = req.body.createdOn;
  var dueDate = req.body.dueDate;
  var customerID = req.body.customerID;

  var sql = "INSERT INTO Orders (OrderName, LocationID, CreatedBy, ApprovedBy, Status, CreatedOn, DueDate, CustomerID) VALUES ('" + orderName + "' ,'" + locationID+ "' ,'" + createdBy + "' ,'" + approveBy + "' ,'" + status + "' ,'" + createdOn + "' ,'" + dueDate + "' ,'" + customerID + "' )" 
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
      res.send(data)
  });
});

app.post('/api/editOrderCommentWithID', function(req, res){
  var orderID = req.body.orderID;
  var comment = req.body.comment;

  var sql = "UPDATE Orders Set Comments = '" + comment + "' WHERE OrderID = " + orderID;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});

app.post('/api/editOrderDetailsWithID', function(req, res){
  var orderID = req.body.orderID;
  var orderName = req.body.orderName;
  var dueDate = req.body.dueDate;

  var sql = "UPDATE Orders Set OrderName = '" + orderName + "', DueDate = '" + dueDate + "' WHERE OrderID = " + orderID;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});

app.post('/api/setNewOrderStatus', function(req, res){
  var orderID = req.body.orderID;
  var newStatus = req.body.newStatus

  var sql = "UPDATE Orders Set Status = '" + newStatus + "' WHERE OrderID = " + orderID;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});

app.post('/api/approveOrderWithID', function(req, res){
  var orderID = req.body.orderID;
  var newStatus = req.body.newStatus;
  var approvedBy = req.body.approvedBy;

  var sql = "UPDATE Orders Set Status = '" + newStatus + "', ApprovedBy = '" + approvedBy + "' WHERE OrderID = " + orderID;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});

app.get('/api/approvetOrder', function(req, res) {
  var orderID = req.body.orderID;
  var status = req.body.status;

  var sql="UPDATE Orders Set Status = '" + status+ "' WHERE OrderID = " + orderID;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
      res.send(data)
  });
});

app.post('/api/deleteOrder', function(req, rest){
  var orderID = req.body.orderID;

  var sql = "DELETE FROM Orders WHERE OrderID=" + String(orderID) + ""
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});

app.post('/api/deleteDetailsUnderOrder', function(req, rest){
  var orderID = req.body.orderID;

  var sql = "DELETE FROM OrderDetails WHERE OrderID=" + String(orderID) + ""
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});



// ================================== Orders Detail Page Endpoints ==================================

app.get('/api/getOrderDetails/:orderID', function(req, res){
  var orderID = req.params["orderID"]
  // console.log(orderID)
  // var sql = "Select * From OrderDetails WHERE OrderDetails.OrderID = '" + String(orderID) + "'"
  sql = `SELECT OrderDetails.OrderDetailID, Variants.VariantID, Categories.CategoryName, Products.ProductName, Variants.VariantIndex, Variants.VariantName, Variants.VariantWidth, Variants.VariantDepth, Variants.VariantHeight, OrderDetails.OrderQuantity, Variants.VariantPrice, Variants.VariantPrice1, Variants.VariantPrice2, Variants.VariantPrice3, Variants.VariantDescription FROM OrderDetails INNER JOIN Variants ON OrderDetails.VariantID = Variants.VariantID INNER JOIN Products ON Variants.ProductID = Products.ProductID INNER JOIN Categories ON Products.CategoryID = Categories.CategoryID WHERE OrderID = ${orderID}`

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
    // console.log(data)
      res.send(data)
  });
});

app.get('/api/getProductFromOrderDetailsID/:orderDetailID', function(req, res){
  var orderDetailID = req.params["orderDetailID"];

  var sql = 'SELECT OrderDetails.OrderDetailID, Products.ProductID, Products.ProductIndex, Products.ProductName, Products.CategoryID, Categories.CategoryName, Products.ProductWidth, Products.ProductHeight, Products.ProductListPrice, OrderDetails.OrderQuantity FROM OrderDetails INNER JOIN Products ON OrderDetails.ProductID = Products.ProductID INNER JOIN Categories ON Products.CategoryID = Categories.CategoryID WHERE OrderDetails.OrderDetailID = "' + String(orderDetailID) + '"';
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
      res.send(data)
  });
})

app.get('/api/loadVariantTableInAddModal', function(req, res){
  var sql = `SELECT Variants.VariantID, Variants.VariantName, Products.ProductName, Categories.CategoryName, Variants.VariantIndex, Variants.VariantPrice, Variants.VariantPrice1, Variants.VariantPrice2, Variants.VariantPrice3 FROM Variants INNER JOIN Products ON Variants.ProductID = Products.ProductID INNER JOIN Categories ON Products.CategoryID = Categories.CategoryID`
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
      res.send(data)
  });
})


app.get('/api/getOrderByID/:orderID', function(req, res){
  var orderID = req.params["orderID"]
  // console.log(orderID)
  // var sql = "Select * From Orders WHERE Orders.OrderID = '" + String(orderID) + "'"
  var sql = `
  SELECT Orders.OrderID, Orders.CustomerID, Orders.LocationID, Orders.OrderName, Orders.CreatedBy, Orders.ApprovedBy, Orders.Comments, Orders.Status, Orders.CreatedOn, Orders.DueDate, Customers.CustomerName, Customers.CustomerContactPersonal FROM Orders INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID WHERE OrderID = ${orderID}
  `
  
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
      res.send(data)
  });
});

// app.post('/api/addOrderDetail', function(req, res){
//   var orderID = req.body.orderID;
//   var productID = req.body.productID;
//   var orderQuantity = req.body.orderQuantity;

//   var sql = "INSERT INTO OrderDetails (OrderID, ProductID, OrderQuantity) VALUES ('" + orderID + "' ,'" + productID+ "' ,'" + orderQuantity + "')"
//   db.query(sql, function (err, data) {
//     if (err){
//       console.log(err)
//     };
   
//       res.send(data)
//   });
// });

app.post('/api/addVariantToOrderDetail', function(req, res){
  var orderID = req.body.orderID;
  var variantID = req.body.variantID;
  var orderQuantity = req.body.orderQuantity;

  var sql = "INSERT INTO OrderDetails (OrderID, VariantID, OrderQuantity) VALUES ('" + orderID + "' ,'" + variantID + "' ,'" + orderQuantity + "')"
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
      res.send(data)
  });
});

app.post('/api/deleteOrderDetail', function(req, rest){
  var orderDetailID = req.body.orderDetailID;

  var sql = "DELETE FROM OrderDetails WHERE OrderDetailID='" + String(orderDetailID) + "'"
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});

app.post('/api/editProductInInventoryByID', function(req, rest){
  var locationID = req.body.locationID;
  var productID = req.body.productID;
  var newQuantity = req.body.newQuantity;

  var sql = "UPDATE Inventories Set Quantity = '" + newQuantity + "' WHERE ProductID = " + productID + " AND LocationID = " + locationID;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
})



// ================================== Login Endpoints ==================================

app.get('/api/getUsers', function(req, res){
  var sql=`SELECT * FROM Users`;
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
})

// ================================== Admin Page Endpoints ==================================

app.post('/api/deleteUser', function(req, res){
  var userID = req.body.userID;

  var sql = "DELETE FROM Users WHERE UserID='" + String(userID) + "'"
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  })
})

app.post('/api/addUser', function(req, res){
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var accessLevel= req.body.accessLevel;

  var sql="INSERT INTO Users (UserLogin, UserPassword, UserName, UserEmail, UserType) VALUES ('" + username + "' ,'" + password+ "' ,'" + name + "' ,'" + email + "' ,'" + accessLevel + "')"
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  })

})

// ================================== Profile Page Endpoints ==================================

app.post('/api/changePassword', function(req, res){
  var password = req.body.password;
  var userID = req.body.userID;

  var sql="UPDATE Users SET UserPassword = '" + password + "' WHERE UserID = '" + userID + "'"
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  })

})


// ================================== Variant Page Endpoints ==================================

// Handles requests for variant pages by product ID
app.get('/api/getVairants/:productID', function(req, res, next) {
  var productID= req.params.productID;

  var sql=`SELECT VariantID, VariantIndex, VariantName, VariantWidth, VariantDepth, VariantHeight, VariantQuality, VariantOrientation, VariantDescription, VariantPrice, VariantPrice1, VariantPrice2, VariantPrice3 FROM Variants WHERE ProductID = ${productID}`;

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});

// Handles requests for the addition of variants
app.post('/api/addVariant', function(req, res) {
  var variantName = req.body.variantName;
  var variantPrice= req.body.variantPrice;
  var variantDescription= req.body.variantDescription;
  var variantIndex = req.body.variantIndex;
  var productID = req.body.productID;

  var variantWidth = req.body.variantWidth;
  var variantHeight = req.body.variantHeight;
  var variantDepth = req.body.variantDepth;
  var variantQuality = req.body.variantQuality;
  var variantOrientation = req.body.variantOrientation;

  var variantPrice1Input = req.body.variantPrice1Input;
  var variantPrice2Input = req.body.variantPrice2Input;
  var variantPrice3Input = req.body.variantPrice3Input;


  var sql=`INSERT INTO Variants (VariantPrice1, VariantPrice2, VariantPrice3, ProductID, VariantName, VariantIndex, VariantDescription, VariantPrice, VariantWidth, VariantHeight, VariantDepth, VariantQuality, VariantOrientation) VALUES ('${variantPrice1Input}', '${variantPrice2Input}', '${variantPrice3Input}', '${productID}', '${variantName}', '${variantIndex}', '${variantDescription}', '${variantPrice}', '${variantWidth}', '${variantHeight}', '${variantDepth}', '${variantQuality}', '${variantOrientation}')`
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
  var variantName = req.body.variantName;
  var variantIndex = req.body.variantIndex;
  var variantDescription = req.body.variantDescription;
  var variantPrice = req.body.variantPrice;

  var variantWidth = req.body.variantWidth;
  var variantHeight = req.body.variantHeight;
  var variantDepth = req.body.variantDepth;
  var variantQuality = req.body.variantQuality;
  var variantOrientation = req.body.variantOrientation;

  var variantPrice1 = req.body.variantPrice1;
  var variantPrice2 = req.body.variantPrice2;
  var variantPrice3 = req.body.variantPrice3;


  var sql = `UPDATE Variants Set VariantIndex = '${variantIndex}', VariantPrice = '${variantPrice}', VariantPrice1 = '${variantPrice1}', VariantPrice2 = '${variantPrice2}', VariantPrice3 = '${variantPrice3}'`;


  if(variantWidth === ""){
    sql += `, VariantWidth = NULL`
  }else{
    sql += `, VariantWidth = '${variantWidth}'`
  }

  if(variantName === ""){
    sql += `, VariantName = NULL`
  }else{
    sql += `, VariantName = '${variantName}'`
  }

  if(variantHeight === ""){
    sql += `, VariantHeight = NULL`
  }else{
    sql += `, VariantHeight = '${variantHeight}'`
  }

  if(variantDepth === ""){
    sql += `, VariantDepth = NULL`
  }else{
    sql += `, VariantDepth = '${variantDepth}'`
  }

  if(variantQuality === ""){
    sql += `, VariantQuality = NULL`
  }else{
    sql += `, VariantQuality = '${variantQuality}'`
  }

  if(variantOrientation === ""){
    sql += `, VariantOrientation = NULL`
  }else{
    sql += `, VariantOrientation = '${variantOrientation}'`
  }
  
  if(variantDescription === ""){
    sql += `, VariantDescription = NULL`
  }else{
    sql += `, VariantDescription = '${variantDescription}'`
  }

  sql += ` WHERE VariantID = ${variantID}`

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
})


// ================================== Customers Page Endpoints ==================================

// Handles requests for customer information for customer table
app.get('/api/getCustomers', function(req, res, next) {
  
  var sql=`SELECT * FROM Customers`;

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});

// Handles requests for customer information for customer table
app.get('/api/getCustomerByID/:customerID', function(req, res, next) {
  var customerID= req.params.customerID;
  
  var sql=`SELECT * FROM Customers WHERE CustomerID = ${customerID}`;

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});


// Handles requests for the addition of variants
app.post('/api/addCustomer', function(req, res) {
  var customerName = req.body.customerName;
  var phoneNumber= req.body.phoneNumber;
  var street= req.body.street;
  var city = req.body.city;
  var state = req.body.state;
  var postalCode = req.body.postalCode;
  var country = req.body.country;
  var notes = req.body.notes;
  var email = req.body.email;
  var contactPerson = req.body.contactPerson;
  var customerGUI = req.body.customerGUI;
  var size = req.body.size;

  var sql=`INSERT INTO Customers (CustomerName, CustomerPhoneNumber, CustomerAddressStreet, CustomerAddressCity, CustomerAddressState, CustomerAddressPostalCode, CustomerAddressCountry, Notes, CustomerEmail, CustomerContactPersonal, CustomerGUINumber, CustomerType) VALUES ('${customerName}', '${phoneNumber}', '${street}', '${city}', '${state}', '${postalCode}', '${country}', '${notes}', '${email}', '${contactPerson}', '${customerGUI}', '${size}')`
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
});


app.post('/api/deleteCustomer', function(req, res){
  var customerID = req.body.customerID;

  var sql = `DELETE FROM Customers WHERE CustomerID = ${customerID}`
  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  })
})

app.post('/api/editCustomer', function(req, rest){
  var customerID = req.body.customerID;
  var customerName = req.body.customerName;
  var phoneNumber = req.body.phoneNumber;
  var street = req.body.street;
  var city = req.body.city;
  var state = req.body.state;
  var postalCode = req.body.postalCode;
  var country = req.body.country;
  var notes = req.body.notes;
  var email = req.body.email;
  var contactPerson = req.body.contactPerson;
  var customerGUI = req.body.customerGUI;
  var customerType = req.body.customerType;

  var sql = `UPDATE Customers Set CustomerName = '${customerName}', CustomerPhoneNumber = '${phoneNumber}', CustomerAddressStreet = '${street}', CustomerAddressCity = '${city}', CustomerAddressState = '${state}', CustomerAddressPostalCode = '${postalCode}', CustomerAddressCountry = '${country}', CustomerEmail = '${email}', CustomerContactPersonal = '${contactPerson}', CustomerGUINumber = '${customerGUI}', CustomerType = '${customerType}'`;


  if(notes === ""){
    sql += `, Notes = NULL`
  }else{
    sql += `, Notes = '${notes}'`
  }

  sql += ` WHERE CustomerID = ${customerID}`


  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
  });
})

// ================================== Customer Details Page Endpoints ==================================

// Handles requests for customer information for customer table
app.get('/api/getCustomerOrdersByID/:customerID', function(req, res, next) {
  var customerID= req.params.customerID;
  
  var sql = `SELECT Orders.OrderID, Orders.OrderName, Orders.CreatedOn, Orders.DueDate, Orders.Status FROM Customers INNER JOIN Orders ON Customers.CustomerID = Orders.CustomerID WHERE Customers.CustomerID = ${customerID}`

  db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});

// ================================== Quotes Page Endpoints ==================================

// Handles requests for customer information for customer table
app.get('/api/getAllOrderInformation/:orderID', function(req, res, next) {
  var orderID= req.params.orderID;
  var sql = `SELECT * 
  FROM Orders 
  JOIN Customers ON Orders.CustomerID = Customers.CustomerID 
  WHERE Orders.OrderID = ${orderID}`
    db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});

// Handles requests for customer information for customer table
app.get('/api/getAllVariantInformation/:orderID', function(req, res, next) {
  var orderID= req.params.orderID;
  var sql = `SELECT Variants.VariantName, Variants.VariantIndex, Variants.VariantQuality, Variants.VariantOrientation, Variants.VariantWidth, Variants.VariantDepth, Variants.VariantHeight, OrderDetails.OrderQuantity, Variants.VariantPrice, Variants.VariantPrice1, Variants.VariantPrice2, Variants.VariantPrice3 FROM Orders INNER JOIN OrderDetails ON OrderDetails.OrderID = Orders.OrderID INNER JOIN Variants ON Variants.VariantID = OrderDetails.VariantID WHERE Orders.OrderID = ${orderID}`

    db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});

// ================================== Customer Invoice Page Endpoints ==================================

app.get('/api/getCustomerOrdersInRange', function(req, res, next) {
  const customerID = req.query.customerID;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  var sql = `SELECT * FROM Orders
  WHERE CustomerID = '${customerID}' AND DueDate BETWEEN '${startDate}' AND '${endDate}' AND (Orders.Status = 'C')`

    db.query(sql, function (err, data) {
    if (err){
      console.log(err)
    };
   
  //   res.render('users-form', { title: 'User List', editData: data[0]});
      // console.log(data)
      res.send(data)
  });
});


app.get("/api/getVariantForAllID", function (req, res, next) {
    const query = req.query;
    const orderIds = query.orderIds;

    const sql = `SELECT Categories.CategoryID, Categories.CategoryName, Products.ProductName, OrderDetails.VariantID, Variants.VariantName, Variants.VariantIndex, Variants.VariantWidth, Variants.VariantDepth, Variants.VariantHeight, Variants.VariantOrientation, Variants.VariantPrice, Variants.VariantPrice1, Variants.VariantPrice2, Variants.VariantPrice3, OrderDetails.OrderQuantity, Variants.VariantDescription FROM OrderDetails INNER JOIN Variants ON OrderDetails.VariantID = Variants.VariantID INNER JOIN Products ON Variants.ProductID = Products.ProductID INNER JOIN Categories ON Products.CategoryID = Categories.CategoryID WHERE (OrderDetails.OrderID = ${orderIds.join(" OR OrderDetails.OrderID = ")
    })`;
    console.log(sql);

    db.query(sql, function (err, data) {
        if (err) {
            console.log(err);
        }

        //   res.render('users-form', { title: 'User List', editData: data[0]});
        // console.log(data)
        res.send(data);
    });
});

