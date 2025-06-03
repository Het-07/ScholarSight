resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "scholarsight-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.region}a"
  map_public_ip_on_launch = true
  tags = {
    Name = "scholarsight-public-subnet"
  }
}

resource "aws_subnet" "public_standby" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"  // Different CIDR block from the primary public subnet
  availability_zone       = "${var.region}b"  // Different AZ from the primary public subnet
  map_public_ip_on_launch = true
  
  tags = {
    Name = "scholarsight-public-standby-subnet"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "scholarsight-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "scholarsight-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_standby" {
  subnet_id      = aws_subnet.public_standby.id
  route_table_id = aws_route_table.public.id
}

//EIP for the NAT gateway
resource "aws_eip" "nat_eip" {
   
  tags = {
    Name = "querygpt_nat_eip"
  }
}
// NAT gateway in the public subnet
resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public.id
  tags = {
    Name = "querygpt_nat_gateway"
  }
}



// Private subnet for the VectorDB instance
resource "aws_subnet" "VectorDB_private_subnet" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-east-1b"  # Modify as needed
  tags = {
    Name = "VectorDB_private_subnet"
  }
}

//route table for vactordb private subnet
resource "aws_route_table" "VectorDB_private_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }
  route {
    cidr_block = "10.0.0.0/16"
    gateway_id = "local"
  } 
    tags = {
        Name = "VectorDB_private_route_table"
    }
}

// Associate the VectorDB private subnet with the route table
resource "aws_route_table_association" "VectorDB_private_subnet_association" {
  subnet_id      = aws_subnet.VectorDB_private_subnet.id
  route_table_id = aws_route_table.VectorDB_private_route_table.id
}

