/**
 * Created by LinYong on 2015-03-09.
 */

function index(req, res, db, logger) {
    console.log("1111");
res.render('../index.html');
}
module.exports = {
    index: index
}