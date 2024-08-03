# Homework

Create the following routes for a telephone directory application

### Datastructure

```
Contact {
    id: String
    firstName: String
    lastName: String (Optional)
    email: String (Optional)
    phone: String (Unique)
    createdAt: Time
}
```

### Requirements

1. Users can create contacts
2. Users can get all the contacts (Sort as per user)
   - `/contacts&order=asc|desc`: Returns all the contacts A-Z
   - `/contacts?sort=createdAt&order=asc|desc`: Returns all the contact sorted by time created
   - `/contacts?sort=lastname&order=asc|desc`: Returns all the contact sorted by last name A-Z and null on the end
3. Users can update / Delete contact
4. Users cannot create contact which already exists with Phone Number
5. Users can get contact by ID `/contacts/id`
6. Users can search contacts `/contacts/search?q=piy` | Fuzzy Search
7. Contact Storage must be durable (On CSV File)

Bonus:

- Try to decrease the search timing
- Add Rate Limiting (Allow only 5 contacts creation per minute)