from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///annotations.db'
db = SQLAlchemy(app)

class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_name = db.Column(db.String(120), nullable=False)
    annotation_data = db.Column(db.String(), nullable=False)

# Use app context for database operations
with app.app_context():
    db.create_all()

@app.route('/upload_annotation', methods=['POST'])
def upload_annotation():
    
    print("start")
    data = request.json
    
    print("data get")
    
    image_name = data.get('image_name')
    annotation_data = data.get('annotation_data')
    
    print(f"data comp: img({image_name}),ano_data({annotation_data})")    
        
    if not image_name or not annotation_data:
        return jsonify({"error": "Invalid data"}), 400

    new_annotation = Annotation(image_name=image_name, annotation_data=annotation_data)
    db.session.add(new_annotation)
    db.session.commit()

    return jsonify({"message": "Successfully saved annotation"}), 201

if __name__ == '__main__':
    app.run(debug=True)
