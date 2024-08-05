# Blogging Application 
```
{
   _id,
   title:  String,
   slug: Unique (url) getting-started-docker,
   body,
   author,
   created,
   updated,
   isActive: true
}
```

1. CURD (DONE)
2. Support for Soft Delete (DONE)
3. Support for adding number of views ona blog (DONE)
4. Add support for commnets in blog (DONE)
5. if blog contains some abusive or bad words , return 400 (DONE)
6. store the ip address of the user when creating blog and commnets (DONE)
7. for views, users can see views based on ip address. example ip 1.2.3.4 viewed a blog for 10 times.  (DONE)
8. Implement Rate limiting on creating and commenting on Blogs (DONE)
9. A perticular ip can not view a particular blog more than 10 times. (DONE)