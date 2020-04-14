async function getID(Model, querry) {
    try {
        let id = await Model.countDocuments(querry);
    }
    catch (error) {
        console.log(error);
        return;
    }
}
